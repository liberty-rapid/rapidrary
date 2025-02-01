import * as cheerio from 'cheerio';
import htmlescape from 'htmlescape';

export function injectInitialData(html: string, data: unknown) {
    const $ = cheerio.load(html);

    $('head').append(
        `<script type="text/javascript">window.__INITIAL_DATA__=JSON.parse(${htmlescape(JSON.stringify(data))});</script>`
    );

    return $.html();
}
