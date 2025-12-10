/**
 * 第三方模块类型声明
 */

// Markdown-it 内部模块
declare module 'markdown-it/lib/token.mjs' {
  import Token from 'markdown-it/lib/token'
  export default Token
}

declare module 'markdown-it/lib/renderer.mjs' {
  import Renderer from 'markdown-it/lib/renderer'
  export default Renderer
}

// markdown-it-table-of-contents
declare module 'markdown-it-table-of-contents' {
  import type MarkdownIt from 'markdown-it'
  interface TocOptions {
    includeLevel?: number[]
    containerClass?: string
    slugify?: (s: string) => string
    markerPattern?: RegExp
    listType?: 'ul' | 'ol'
    format?: (content: string, md: MarkdownIt) => string
    forceFullToc?: boolean
    containerHeaderHtml?: string
    containerFooterHtml?: string
  }
  const plugin: (md: MarkdownIt, options?: TocOptions) => void
  export default plugin
}

// markdown-it-emoji
declare module 'markdown-it-emoji' {
  import type MarkdownIt from 'markdown-it'
  interface EmojiOptions {
    defs?: Record<string, string>
    enabled?: string[]
    shortcuts?: Record<string, string | string[]>
  }
  const plugin: MarkdownIt.PluginWithOptions<EmojiOptions>
  export default plugin
}

// polka
declare module 'polka' {
  import type { Server, IncomingMessage, ServerResponse } from 'http'

  interface Request extends IncomingMessage {
    params: Record<string, string>
    query: Record<string, string>
    path: string
    search: string
  }

  type NextFunction = (err?: Error) => void
  type Middleware = (req: Request, res: ServerResponse, next: NextFunction) => void

  interface Polka {
    use(...handlers: Middleware[]): Polka
    use(path: string, ...handlers: Middleware[]): Polka
    get(path: string, ...handlers: Middleware[]): Polka
    post(path: string, ...handlers: Middleware[]): Polka
    put(path: string, ...handlers: Middleware[]): Polka
    delete(path: string, ...handlers: Middleware[]): Polka
    listen(port: number, hostname?: string): Promise<void>
    listen(port: number, callback?: () => void): Promise<void>
    handler: (req: IncomingMessage, res: ServerResponse) => void
    server: Server
  }

  function polka(): Polka
  export default polka
}

// sirv
declare module 'sirv' {
  import type { IncomingMessage, ServerResponse } from 'http'

  interface SirvOptions {
    dev?: boolean
    etag?: boolean
    maxAge?: number
    immutable?: boolean
    single?: boolean | string
    ignores?: boolean | string[]
    extensions?: string[]
    dotfiles?: boolean
    brotli?: boolean
    gzip?: boolean
    onNoMatch?: (req: IncomingMessage, res: ServerResponse) => void
  }

  type RequestHandler = (req: IncomingMessage, res: ServerResponse, next?: () => void) => void

  function sirv(dir: string, opts?: SirvOptions): RequestHandler
  export default sirv
}

// compression
declare module 'compression' {
  import type { IncomingMessage, ServerResponse } from 'http'

  interface CompressionOptions {
    filter?: (req: IncomingMessage, res: ServerResponse) => boolean
    level?: number
    memLevel?: number
    strategy?: number
    threshold?: number | string
    windowBits?: number
    chunkSize?: number
  }

  type CompressionMiddleware = (req: IncomingMessage, res: ServerResponse, next: () => void) => void

  function compression(options?: CompressionOptions): CompressionMiddleware
  export default compression
}
