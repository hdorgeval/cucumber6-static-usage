/* eslint-disable @typescript-eslint/ban-types */
import EventEmitter from 'events';

export enum TestStepResultStatus {
  UNKNOWN = 'UNKNOWN',
  PASSED = 'PASSED',
  SKIPPED = 'SKIPPED',
  PENDING = 'PENDING',
  UNDEFINED = 'UNDEFINED',
  AMBIGUOUS = 'AMBIGUOUS',
  FAILED = 'FAILED',
}
export interface Scenario {
  steps: Step[];
}
export interface Feature {
  children: FeatureChild[];
}
export interface FeatureChild {
  scenario: Scenario;
  background: Background;
  rule: Rule;
}
export interface Rule {
  children: RuleChild[];
}
export interface RuleChild {
  background: Background;
  scenario: Scenario;
}
export interface GherkinDocument {
  feature: Feature;
}
export interface Background {
  steps: Step[];
}
export interface Location {
  line: number;

  column?: number;
}
export interface Step {
  id: string;
  location: Location;
}

export interface Pickle {
  steps: PickleStep[];
  uri: string;
}
export interface PickleStep {
  id: string;
  astNodeIds: readonly string[];
  text: string;
}
export interface IUsageMatch {
  duration?: Duration;
  line: number;
  text: string;
  uri: string;
}
export interface Expression {
  readonly source: string;
  match(text: string): ReadonlyArray<unknown>;
}
export interface StepDefinition {
  // tslint:disable:ban-types
  code: Function;
  id: string;
  unwrappedCode?: Function;
  // tslint:enable:ban-types
  line: number;
  options: {};
  pattern: unknown;
  uri: string;
  expression: Expression;
}

export interface Duration {
  seconds: number;

  nanos: number;
}

export interface IUsage {
  code: string;
  line: number;
  matches: IUsageMatch[];
  meanDuration?: Duration;
  pattern: string;
  patternType: string;
  uri: string;
}

export interface ITestCaseAttempt {
  attempt: number;
  pickle: Pickle;
  gherkinDocument: GherkinDocument;
  testCase: TestCase;
  stepResults: Record<string, TestStepResult>;
}
export interface TestStepResult {
  duration: Duration;
  status: TestStepResultStatus;
}
export interface TestCase {
  id: string;
  testSteps: TestStep[];
}
export interface TestStep {
  id: string;
  stepDefinitionIds: readonly string[];
  pickleStepId: string;
}
export interface EventDataCollector {
  getTestCaseAttempts: () => ITestCaseAttempt[];
}
export interface IGetUsageRequest {
  cwd: string;
  eventDataCollector: EventDataCollector;
  stepDefinitions: StepDefinition[];
}
export const unexecutedStatuses: readonly TestStepResultStatus[] = [
  TestStepResultStatus.AMBIGUOUS,
  TestStepResultStatus.SKIPPED,
  TestStepResultStatus.UNDEFINED,
];

export const MILLISECONDS_PER_SECOND = 1e3;
export const NANOSECONDS_PER_MILLISECOND = 1e6;
export const NANOSECONDS_PER_SECOND = 1e9;

export type IColorFn = (text: string) => string;
export interface IColorFns {
  forStatus: (status: TestStepResultStatus) => IColorFn;
  location: IColorFn;
  tag: IColorFn;
  diffAdded: IColorFn;
  diffRemoved: IColorFn;
  errorMessage: IColorFn;
  errorStack: IColorFn;
}
export type IFormatterLogFn = (buffer: string | Uint8Array) => void;

export interface IParsedArgvFormatRerunOptions {
  separator?: string;
}
export enum SnippetInterface {
  AsyncAwait = 'async-await',
  Callback = 'callback',
  Generator = 'generator',
  Promise = 'promise',
  Synchronous = 'synchronous',
}
export interface IParsedArgvFormatOptions {
  colorsEnabled?: boolean;
  rerun?: IParsedArgvFormatRerunOptions;
  snippetInterface?: SnippetInterface;
  snippetSyntax?: string;
  [customKey: string]: unknown;
}
export type IFormatterCleanupFn = () => Promise<unknown>;
export interface TestCaseHookDefinition {
  tagExpression: string;
}
export interface TestStepHookDefinition {
  tagExpression: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TestRunHookDefinition {}
export interface UndefinedParameterType {
  expression: string;

  name: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ParameterTypeRegistry {}
export interface ISupportCodeLibrary {
  readonly afterTestCaseHookDefinitions: TestCaseHookDefinition[];
  readonly afterTestStepHookDefinitions: TestStepHookDefinition[];
  readonly afterTestRunHookDefinitions: TestRunHookDefinition[];
  readonly beforeTestCaseHookDefinitions: TestCaseHookDefinition[];
  readonly beforeTestStepHookDefinitions: TestStepHookDefinition[];
  readonly beforeTestRunHookDefinitions: TestRunHookDefinition[];
  readonly defaultTimeout: number;
  readonly stepDefinitions: StepDefinition[];
  readonly undefinedParameterTypes: UndefinedParameterType[];
  readonly parameterTypeRegistry: ParameterTypeRegistry;
  readonly World: unknown;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StepDefinitionSnippetBuilder {}
export interface IFormatterOptions {
  colorFns: IColorFns;
  cwd: string;
  eventBroadcaster: EventEmitter;
  eventDataCollector: EventDataCollector;
  log: IFormatterLogFn;
  parsedArgvOptions: IParsedArgvFormatOptions;
  snippetBuilder: StepDefinitionSnippetBuilder;
  stream: WritableStream;
  cleanup: IFormatterCleanupFn;
  supportCodeLibrary: ISupportCodeLibrary;
}
