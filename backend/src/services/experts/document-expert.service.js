import pdfParse from 'pdf-parse';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { log } from '../../utils/logger.js';

/**
 * Agente Experto en Lectura de Documentación
 * Especializado en extraer información de PDFs grandes y sitios web
 */

/**
 * Leer PDF de hasta 1500 páginas
 * Procesa el PDF por chunks para evitar problemas de memoria
 */
export async function readLargePDF(fileBuffer) {
    try {
        log.info('Leyendo PDF grande', {
            module: 'document-expert',
            size: fileBuffer.length
        });

        // Parsear PDF completo
        const pdfData = await pdfParse(fileBuffer, {
            max: 0, // Sin límite de páginas
            version: 'v2.0.550'
        });

        log.info('PDF procesado exitosamente', {
            module: 'document-expert',
            pages: pdfData.numpages,
            textLength: pdfData.text.length
        });

        // Si el PDF es muy grande (>1000 páginas), dividir en secciones
        if (pdfData.numpages > 1000) {
            return {
                text: pdfData.text,
                pages: pdfData.numpages,
                sections: splitIntoSections(pdfData.text),
                metadata: {
                    info: pdfData.info,
                    metadata: pdfData.metadata
                }
            };
        }

        return {
            text: pdfData.text,
            pages: pdfData.numpages,
            metadata: {
                info: pdfData.info,
                metadata: pdfData.metadata
            }
        };
    } catch (error) {
        log.error('Error al leer PDF', error, {
            module: 'document-expert'
        });
        throw error;
    }
}

/**
 * Dividir texto largo en secciones manejables
 */
function splitIntoSections(text, maxCharsPerSection = 50000) {
    const sections = [];
    let currentSection = '';
    const lines = text.split('\n');

    for (const line of lines) {
        if (currentSection.length + line.length > maxCharsPerSection) {
            sections.push(currentSection);
            currentSection = line;
        } else {
            currentSection += '\n' + line;
        }
    }

    if (currentSection) {
        sections.push(currentSection);
    }

    return sections;
}

/**
 * Scraping de sitio web completo
 * Navega por el sitio para encontrar toda la documentación
 */
export async function scrapWebsite(url) {
    try {
        log.info('Iniciando scraping de sitio web', {
            module: 'document-expert',
            url
        });

        const visitedUrls = new Set();
        const documentationPages = [];
        const baseUrl = new URL(url).origin;

        // Función recursiva para navegar el sitio
        async function crawlPage(pageUrl, depth = 0) {
            // Límite de profundidad para evitar loops infinitos
            if (depth > 5 || visitedUrls.has(pageUrl)) {
                return;
            }

            visitedUrls.add(pageUrl);

            try {
                const response = await axios.get(pageUrl, {
                    timeout: 10000,
                    headers: {
                        'User-Agent': 'DataLIVE Documentation Scraper/1.0'
                    }
                });

                const $ = cheerio.load(response.data);
                const pageText = $('body').text();

                // Guardar contenido de la página
                documentationPages.push({
                    url: pageUrl,
                    title: $('title').text(),
                    content: pageText,
                    headings: $('h1, h2, h3').map((i, el) => $(el).text()).get()
                });

                log.debug('Página scrapeada', {
                    module: 'document-expert',
                    url: pageUrl,
                    contentLength: pageText.length
                });

                // Buscar enlaces a otras páginas de documentación
                const links = $('a[href]').map((i, el) => $(el).attr('href')).get();

                for (const link of links) {
                    try {
                        const absoluteUrl = new URL(link, pageUrl).href;

                        // Solo seguir enlaces del mismo dominio
                        if (absoluteUrl.startsWith(baseUrl) &&
                            !visitedUrls.has(absoluteUrl) &&
                            isDocumentationUrl(absoluteUrl)) {
                            await crawlPage(absoluteUrl, depth + 1);
                        }
                    } catch (e) {
                        // Ignorar URLs inválidas
                    }
                }
            } catch (error) {
                log.warn('Error al scrapear página', {
                    module: 'document-expert',
                    url: pageUrl,
                    error: error.message
                });
            }
        }

        // Iniciar crawling
        await crawlPage(url);

        log.info('Scraping completado', {
            module: 'document-expert',
            url,
            pagesFound: documentationPages.length
        });

        return {
            baseUrl,
            pages: documentationPages,
            totalPages: documentationPages.length,
            combinedText: documentationPages.map(p => p.content).join('\n\n')
        };
    } catch (error) {
        log.error('Error en scraping de sitio web', error, {
            module: 'document-expert',
            url
        });
        throw error;
    }
}

/**
 * Determinar si una URL es de documentación
 */
function isDocumentationUrl(url) {
    const docKeywords = [
        '/docs', '/documentation', '/api', '/reference',
        '/guide', '/tutorial', '/getting-started', '/endpoints'
    ];

    return docKeywords.some(keyword => url.toLowerCase().includes(keyword));
}

/**
 * Detectar formato de documentación de API
 */
export function detectAPIFormat(text) {
    const formats = {
        openapi: /openapi|swagger/i.test(text),
        postman: /postman|collection/i.test(text),
        raml: /raml|#%RAML/i.test(text),
        apiblueprint: /api blueprint|FORMAT:/i.test(text),
        wadl: /wadl|application\.wadl/i.test(text),
        graphql: /graphql|query|mutation/i.test(text),
        rest: /rest|restful|endpoint/i.test(text),
        soap: /soap|wsdl/i.test(text)
    };

    const detectedFormats = Object.entries(formats)
        .filter(([_, matches]) => matches)
        .map(([format]) => format);

    log.info('Formatos de API detectados', {
        module: 'document-expert',
        formats: detectedFormats
    });

    return detectedFormats;
}

/**
 * Extraer ejemplos de código de la documentación
 */
export function extractCodeExamples(text) {
    const codeBlocks = [];

    // Buscar bloques de código en markdown
    const markdownCodeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = markdownCodeRegex.exec(text)) !== null) {
        codeBlocks.push({
            language: match[1] || 'unknown',
            code: match[2].trim()
        });
    }

    // Buscar ejemplos de curl
    const curlRegex = /curl\s+(-[A-Z]\s+\S+\s+)*https?:\/\/[^\s]+/gi;
    const curlExamples = text.match(curlRegex) || [];

    curlExamples.forEach(curl => {
        codeBlocks.push({
            language: 'curl',
            code: curl
        });
    });

    log.debug('Ejemplos de código extraídos', {
        module: 'document-expert',
        count: codeBlocks.length
    });

    return codeBlocks;
}
