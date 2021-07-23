import {
  IColorFns,
  EventDataCollector,
  IFormatterLogFn,
  ISupportCodeLibrary,
  IFormatterCleanupFn,
  IFormatterOptions,
  StepDefinitionSnippetBuilder,
} from './types';

export class Formatter {
  protected colorFns: IColorFns;
  protected cwd: string;
  protected eventDataCollector: EventDataCollector;
  protected log: IFormatterLogFn;
  protected snippetBuilder: StepDefinitionSnippetBuilder;
  protected stream: WritableStream;
  protected supportCodeLibrary: ISupportCodeLibrary;
  private readonly cleanup: IFormatterCleanupFn;

  constructor(options: IFormatterOptions) {
    this.colorFns = options.colorFns;
    this.cwd = options.cwd;
    this.eventDataCollector = options.eventDataCollector;
    this.log = options.log;
    this.snippetBuilder = options.snippetBuilder;
    this.stream = options.stream;
    this.supportCodeLibrary = options.supportCodeLibrary;
    this.cleanup = options.cleanup;
  }

  async finished(): Promise<void> {
    await this.cleanup();
  }
}
