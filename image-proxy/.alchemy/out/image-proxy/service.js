var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/.pnpm/unenv@2.0.0-rc.21/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/.pnpm/unenv@2.0.0-rc.21/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/.pnpm/@cloudflare+unenv-preset@2.7.7_unenv@2.0.0-rc.21_workerd@1.20251105.0/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/.pnpm/unenv@2.0.0-rc.21/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/.pnpm/unenv@2.0.0-rc.21/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/.pnpm/unenv@2.0.0-rc.21/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/.pnpm/@cloudflare+unenv-preset@2.7.7_unenv@2.0.0-rc.21_workerd@1.20251105.0/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/.pnpm/alchemy@0.77.0_workerd@1.20251105.0_wrangler@4.46.0_@cloudflare+workers-types@4.20251109.0_/node_modules/alchemy/lib/cloudflare/bundle/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/.pnpm/unenv@2.0.0-rc.21/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/.pnpm/unenv@2.0.0-rc.21/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/.pnpm/unenv@2.0.0-rc.21/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/.pnpm/unenv@2.0.0-rc.21/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/.pnpm/unenv@2.0.0-rc.21/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/.pnpm/unenv@2.0.0-rc.21/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/.pnpm/@cloudflare+unenv-preset@2.7.7_unenv@2.0.0-rc.21_workerd@1.20251105.0/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
var unenvProcess = new Process({
  env: globalProcess.env,
  // `hrtime` is only available from workerd process v2
  hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  // Always implemented by workerd
  env,
  // Only implemented in workerd v2
  hrtime: hrtime3,
  // Always implemented by workerd
  nextTick
} = unenvProcess;
var {
  _channel,
  _disconnect,
  _events,
  _eventsCount,
  _handleQueue,
  _maxListeners,
  _pendingMessage,
  _send,
  assert: assert2,
  disconnect,
  mainModule
} = unenvProcess;
var {
  // @ts-expect-error `_debugEnd` is missing typings
  _debugEnd,
  // @ts-expect-error `_debugProcess` is missing typings
  _debugProcess,
  // @ts-expect-error `_exiting` is missing typings
  _exiting,
  // @ts-expect-error `_fatalException` is missing typings
  _fatalException,
  // @ts-expect-error `_getActiveHandles` is missing typings
  _getActiveHandles,
  // @ts-expect-error `_getActiveRequests` is missing typings
  _getActiveRequests,
  // @ts-expect-error `_kill` is missing typings
  _kill,
  // @ts-expect-error `_linkedBinding` is missing typings
  _linkedBinding,
  // @ts-expect-error `_preload_modules` is missing typings
  _preload_modules,
  // @ts-expect-error `_rawDebug` is missing typings
  _rawDebug,
  // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
  _startProfilerIdleNotifier,
  // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
  _stopProfilerIdleNotifier,
  // @ts-expect-error `_tickCallback` is missing typings
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  availableMemory,
  // @ts-expect-error `binding` is missing typings
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  // @ts-expect-error `domain` is missing typings
  domain,
  emit,
  emitWarning,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  // @ts-expect-error `initgroups` is missing typings
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  memoryUsage,
  // @ts-expect-error `moduleLoadList` is missing typings
  moduleLoadList,
  off,
  on,
  once,
  // @ts-expect-error `openStdin` is missing typings
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  // @ts-expect-error `reallyExit` is missing typings
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/.pnpm/alchemy@0.77.0_workerd@1.20251105.0_wrangler@4.46.0_@cloudflare+workers-types@4.20251109.0_/node_modules/alchemy/lib/cloudflare/bundle/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/service.ts
import { WorkerEntrypoint } from "cloudflare:workers";

// node_modules/.pnpm/@cf-wasm+internals@0.1.0/node_modules/@cf-wasm/internals/dist/polyfills/image-data.js
var globalObject = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : self;
if (!("ImageData" in globalObject)) {
  let getColorSpaceFromImageSettings = /* @__PURE__ */ __name(function(imageSettings) {
    if (typeof imageSettings !== "undefined") {
      if (typeof imageSettings !== "object") {
        throw new TypeError("Failed to construct 'ImageData': The provided value is not of type 'ImageDataSettings'.");
      }
      if (imageSettings && "colorSpace" in imageSettings && typeof imageSettings.colorSpace !== "undefined") {
        if (typeof imageSettings.colorSpace !== "string" || !colorSpaceEnum.includes(imageSettings.colorSpace)) {
          throw new TypeError(
            `Failed to construct 'ImageData': Failed to read the 'colorSpace' property from 'ImageDataSettings': The provided value '${imageSettings.colorSpace}' is not a valid enum value of type PredefinedColorSpace.`
          );
        }
        return imageSettings.colorSpace;
      }
    }
    return "srgb";
  }, "getColorSpaceFromImageSettings");
  getColorSpaceFromImageSettings2 = getColorSpaceFromImageSettings;
  const widthMap = /* @__PURE__ */ new WeakMap();
  const heightMap = /* @__PURE__ */ new WeakMap();
  const colorSpaceMap = /* @__PURE__ */ new WeakMap();
  const colorSpaceEnum = ["display-p3", "srgb"];
  class ImageData22 {
    static {
      __name(this, "ImageData2");
    }
    constructor(...args) {
      let imageWidth;
      let imageHeight;
      let imageData;
      let imageColorSpace;
      const [arg1, arg2, arg3, arg4] = args;
      if (args.length < 2) {
        throw new TypeError(`Failed to construct 'ImageData': 2 arguments required, but only ${args.length} present.`);
      }
      if (typeof arg1 === "object") {
        if (!(arg1 instanceof Uint8ClampedArray)) {
          throw new TypeError("Failed to construct 'ImageData': parameter 1 is not of type 'Uint8ClampedArray'.");
        }
        if (typeof arg2 !== "number" || arg2 === 0) {
          throw new Error("Failed to construct 'ImageData': The source width is zero or not a number.");
        }
        imageData = arg1;
        imageWidth = arg2 >>> 0;
        if (imageWidth * 4 > imageData.length) {
          throw new Error("Failed to construct 'ImageData': The requested image size exceeds the supported range.");
        }
        if (imageData.length % 4 !== 0) {
          throw new Error("Failed to construct 'ImageData': The input data length is not a multiple of 4.");
        }
        if (imageData.length % (4 * imageWidth) !== 0) {
          throw new Error("Failed to construct 'ImageData': The input data length is not a multiple of (4 * width).");
        }
        if (typeof arg3 !== "undefined") {
          if (typeof arg3 !== "number" || arg3 === 0) {
            throw new Error("Failed to construct 'ImageData': The source height is zero or not a number.");
          }
          imageHeight = arg3 >>> 0;
          if (imageData.length % (4 * imageWidth * imageHeight) !== 0) {
            throw new Error("Failed to construct 'ImageData': The input data length is not equal to (4 * width * height).");
          }
        } else {
          imageHeight = imageData.byteLength / imageWidth / 4;
        }
        imageColorSpace = getColorSpaceFromImageSettings(arg4);
      } else {
        if (typeof arg1 !== "number" || arg1 === 0) {
          throw new Error("Failed to construct 'ImageData': The source width is zero or not a number.");
        }
        imageWidth = arg1 >>> 0;
        if (typeof arg2 !== "number" || arg2 === 0) {
          throw new Error("Failed to construct 'ImageData': The source height is zero or not a number.");
        }
        imageHeight = arg2 >>> 0;
        if (imageWidth * imageHeight >= 1 << 30) {
          throw new Error("Failed to construct 'ImageData': The requested image size exceeds the supported range.");
        }
        imageData = new Uint8ClampedArray(imageWidth * imageHeight * 4);
        imageColorSpace = getColorSpaceFromImageSettings(arg3);
      }
      widthMap.set(this, imageWidth);
      heightMap.set(this, imageHeight);
      colorSpaceMap.set(this, imageColorSpace);
      Object.defineProperty(this, "data", {
        configurable: true,
        enumerable: true,
        value: imageData,
        writable: false
      });
    }
  }
  Object.defineProperty(ImageData22.prototype, "width", {
    enumerable: true,
    configurable: true,
    get() {
      return widthMap.get(this);
    }
  });
  Object.defineProperty(ImageData22.prototype, "height", {
    enumerable: true,
    configurable: true,
    get() {
      return heightMap.get(this);
    }
  });
  Object.defineProperty(ImageData22.prototype, "colorSpace", {
    enumerable: true,
    configurable: true,
    get() {
      return colorSpaceMap.get(this);
    }
  });
  globalObject.ImageData = ImageData22;
}
var getColorSpaceFromImageSettings2;
var ImageData2 = globalObject.ImageData;

// node_modules/.pnpm/@cf-wasm+photon@0.2.1/node_modules/@cf-wasm/photon/dist/chunk-XSJYIU2V.js
var wasm;
function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc();
  wasm.__wbindgen_export_2.set(idx, obj);
  return idx;
}
__name(addToExternrefTable0, "addToExternrefTable0");
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store(idx);
  }
}
__name(handleError, "handleError");
function isLikeNone(x) {
  return x === void 0 || x === null;
}
__name(isLikeNone, "isLikeNone");
var cachedTextDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }) : { decode: /* @__PURE__ */ __name(() => {
  throw Error("TextDecoder not available");
}, "decode") };
if (typeof TextDecoder !== "undefined") {
  cachedTextDecoder.decode();
}
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
__name(getUint8ArrayMemory0, "getUint8ArrayMemory0");
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
__name(getStringFromWasm0, "getStringFromWasm0");
var WASM_VECTOR_LEN = 0;
function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
__name(passArray8ToWasm0, "passArray8ToWasm0");
var cachedDataViewMemory0 = null;
function getDataViewMemory0() {
  if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || cachedDataViewMemory0.buffer.detached === void 0 && cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}
__name(getDataViewMemory0, "getDataViewMemory0");
var cachedUint8ClampedArrayMemory0 = null;
function getUint8ClampedArrayMemory0() {
  if (cachedUint8ClampedArrayMemory0 === null || cachedUint8ClampedArrayMemory0.byteLength === 0) {
    cachedUint8ClampedArrayMemory0 = new Uint8ClampedArray(wasm.memory.buffer);
  }
  return cachedUint8ClampedArrayMemory0;
}
__name(getUint8ClampedArrayMemory0, "getUint8ClampedArrayMemory0");
function getClampedArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ClampedArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
__name(getClampedArrayU8FromWasm0, "getClampedArrayU8FromWasm0");
var cachedTextEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder("utf-8") : { encode: /* @__PURE__ */ __name(() => {
  throw Error("TextEncoder not available");
}, "encode") };
var encodeString = typeof cachedTextEncoder.encodeInto === "function" ? function(arg, view) {
  return cachedTextEncoder.encodeInto(arg, view);
} : function(arg, view) {
  const buf = cachedTextEncoder.encode(arg);
  view.set(buf);
  return {
    read: arg.length,
    written: buf.length
  };
};
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset2 = 0;
  for (; offset2 < len; offset2++) {
    const code = arg.charCodeAt(offset2);
    if (code > 127) break;
    mem[ptr + offset2] = code;
  }
  if (offset2 !== len) {
    if (offset2 !== 0) {
      arg = arg.slice(offset2);
    }
    ptr = realloc(ptr, len, len = offset2 + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset2, ptr + len);
    const ret = encodeString(arg, view);
    offset2 += ret.written;
    ptr = realloc(ptr, len, offset2, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset2;
  return ptr;
}
__name(passStringToWasm0, "passStringToWasm0");
function debugString(val) {
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  if (Array.isArray(val)) {
    const length = val.length;
    let debug3 = "[";
    if (length > 0) {
      debug3 += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug3 += ", " + debugString(val[i]);
    }
    debug3 += "]";
    return debug3;
  }
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches && builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    return toString.call(val);
  }
  if (className == "Object") {
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  if (val instanceof Error) {
    return `${val.name}: ${val.message}
${val.stack}`;
  }
  return className;
}
__name(debugString, "debugString");
function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error(`expected instance of ${klass.name}`);
  }
}
__name(_assertClass, "_assertClass");
function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
__name(getArrayU8FromWasm0, "getArrayU8FromWasm0");
function resize(photon_img, width, height, sampling_filter) {
  _assertClass(photon_img, PhotonImage);
  const ret = wasm.resize(photon_img.__wbg_ptr, width, height, sampling_filter);
  return PhotonImage.__wrap(ret);
}
__name(resize, "resize");
var SamplingFilter = Object.freeze({
  Nearest: 1,
  "1": "Nearest",
  Triangle: 2,
  "2": "Triangle",
  CatmullRom: 3,
  "3": "CatmullRom",
  Gaussian: 4,
  "4": "Gaussian",
  Lanczos3: 5,
  "5": "Lanczos3"
});
var PhotonImageFinalization = typeof FinalizationRegistry === "undefined" ? { register: /* @__PURE__ */ __name(() => {
}, "register"), unregister: /* @__PURE__ */ __name(() => {
}, "unregister") } : new FinalizationRegistry((ptr) => wasm.__wbg_photonimage_free(ptr >>> 0, 1));
var PhotonImage = class _PhotonImage {
  static {
    __name(this, "_PhotonImage");
  }
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(_PhotonImage.prototype);
    obj.__wbg_ptr = ptr;
    PhotonImageFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PhotonImageFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_photonimage_free(ptr, 0);
  }
  /**
   * Create a new PhotonImage from a Vec of u8s, which represent raw pixels.
   * @param {Uint8Array} raw_pixels
   * @param {number} width
   * @param {number} height
   */
  constructor(raw_pixels, width, height) {
    const ptr0 = passArray8ToWasm0(raw_pixels, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.photonimage_new(ptr0, len0, width, height);
    this.__wbg_ptr = ret >>> 0;
    PhotonImageFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * Create a new PhotonImage from a base64 string.
   * @param {string} base64
   * @returns {PhotonImage}
   */
  static new_from_base64(base64) {
    const ptr0 = passStringToWasm0(base64, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.base64_to_image(ptr0, len0);
    return _PhotonImage.__wrap(ret);
  }
  /**
   * Create a new PhotonImage from a byteslice.
   * @param {Uint8Array} vec
   * @returns {PhotonImage}
   */
  static new_from_byteslice(vec) {
    const ptr0 = passArray8ToWasm0(vec, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.photonimage_new_from_byteslice(ptr0, len0);
    return _PhotonImage.__wrap(ret);
  }
  /**
   * Create a new PhotonImage from a Blob/File.
   * @param {Blob} blob
   * @returns {PhotonImage}
   */
  static new_from_blob(blob) {
    const ret = wasm.photonimage_new_from_blob(blob);
    return _PhotonImage.__wrap(ret);
  }
  /**
   * Create a new PhotonImage from a HTMLImageElement
   * @param {HTMLImageElement} image
   * @returns {PhotonImage}
   */
  static new_from_image(image) {
    const ret = wasm.photonimage_new_from_image(image);
    return _PhotonImage.__wrap(ret);
  }
  /**
   * Get the width of the PhotonImage.
   * @returns {number}
   */
  get_width() {
    const ret = wasm.photonimage_get_width(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * Get the PhotonImage's pixels as a Vec of u8s.
   * @returns {Uint8Array}
   */
  get_raw_pixels() {
    const ret = wasm.photonimage_get_raw_pixels(this.__wbg_ptr);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * Get the height of the PhotonImage.
   * @returns {number}
   */
  get_height() {
    const ret = wasm.photonimage_get_height(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * Convert the PhotonImage to base64.
   * @returns {string}
   */
  get_base64() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.photonimage_get_base64(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Convert the PhotonImage to raw bytes. Returns PNG.
   * @returns {Uint8Array}
   */
  get_bytes() {
    const ret = wasm.photonimage_get_bytes(this.__wbg_ptr);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * Convert the PhotonImage to raw bytes. Returns a JPEG.
   * @param {number} quality
   * @returns {Uint8Array}
   */
  get_bytes_jpeg(quality) {
    const ret = wasm.photonimage_get_bytes_jpeg(this.__wbg_ptr, quality);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * Convert the PhotonImage to raw bytes. Returns a WEBP.
   * @returns {Uint8Array}
   */
  get_bytes_webp() {
    const ret = wasm.photonimage_get_bytes_webp(this.__wbg_ptr);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * Convert the PhotonImage's raw pixels to JS-compatible ImageData.
   * @returns {ImageData}
   */
  get_image_data() {
    const ret = wasm.photonimage_get_image_data(this.__wbg_ptr);
    return ret;
  }
  /**
   * Convert ImageData to raw pixels, and update the PhotonImage's raw pixels to this.
   * @param {ImageData} img_data
   */
  set_imgdata(img_data) {
    wasm.photonimage_set_imgdata(this.__wbg_ptr, img_data);
  }
  /**
   * Calculates estimated filesize and returns number of bytes
   * @returns {bigint}
   */
  get_estimated_filesize() {
    const ret = wasm.photonimage_get_estimated_filesize(this.__wbg_ptr);
    return BigInt.asUintN(64, ret);
  }
};
var RgbFinalization = typeof FinalizationRegistry === "undefined" ? { register: /* @__PURE__ */ __name(() => {
}, "register"), unregister: /* @__PURE__ */ __name(() => {
}, "unregister") } : new FinalizationRegistry((ptr) => wasm.__wbg_rgb_free(ptr >>> 0, 1));
var RgbaFinalization = typeof FinalizationRegistry === "undefined" ? { register: /* @__PURE__ */ __name(() => {
}, "register"), unregister: /* @__PURE__ */ __name(() => {
}, "unregister") } : new FinalizationRegistry((ptr) => wasm.__wbg_rgba_free(ptr >>> 0, 1));
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get("Content-Type") != "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}
__name(__wbg_load, "__wbg_load");
function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbg_appendChild_8204974b7328bf98 = function() {
    return handleError(function(arg0, arg1) {
      const ret = arg0.appendChild(arg1);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_body_942ea927546a04ba = function(arg0) {
    const ret = arg0.body;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
    const ret = arg0.buffer;
    return ret;
  };
  imports.wbg.__wbg_call_672a4d21634d4a24 = function() {
    return handleError(function(arg0, arg1) {
      const ret = arg0.call(arg1);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_createElement_8c9931a732ee2fea = function() {
    return handleError(function(arg0, arg1, arg2) {
      const ret = arg0.createElement(getStringFromWasm0(arg1, arg2));
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_data_d1ed736c1e42b10e = function(arg0, arg1) {
    const ret = arg1.data;
    const ptr1 = passArray8ToWasm0(ret, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_document_d249400bd7bd996d = function(arg0) {
    const ret = arg0.document;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_drawImage_03f7ae2a95a9605f = function() {
    return handleError(function(arg0, arg1, arg2, arg3) {
      arg0.drawImage(arg1, arg2, arg3);
    }, arguments);
  };
  imports.wbg.__wbg_drawImage_2603e2b61e66d571 = function() {
    return handleError(function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
      arg0.drawImage(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
    }, arguments);
  };
  imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
    let deferred0_0;
    let deferred0_1;
    try {
      deferred0_0 = arg0;
      deferred0_1 = arg1;
      console.error(getStringFromWasm0(arg0, arg1));
    } finally {
      wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
    }
  };
  imports.wbg.__wbg_getContext_e9cf379449413580 = function() {
    return handleError(function(arg0, arg1, arg2) {
      const ret = arg0.getContext(getStringFromWasm0(arg1, arg2));
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    }, arguments);
  };
  imports.wbg.__wbg_getImageData_c02374a30b126dab = function() {
    return handleError(function(arg0, arg1, arg2, arg3, arg4) {
      const ret = arg0.getImageData(arg1, arg2, arg3, arg4);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_height_1d93eb7f5e355d97 = function(arg0) {
    const ret = arg0.height;
    return ret;
  };
  imports.wbg.__wbg_height_838cee19ba8597db = function(arg0) {
    const ret = arg0.height;
    return ret;
  };
  imports.wbg.__wbg_height_d3f39e12f0f62121 = function(arg0) {
    const ret = arg0.height;
    return ret;
  };
  imports.wbg.__wbg_instanceof_CanvasRenderingContext2d_df82a4d3437bf1cc = function(arg0) {
    let result;
    try {
      result = arg0 instanceof CanvasRenderingContext2D;
    } catch (_) {
      result = false;
    }
    const ret = result;
    return ret;
  };
  imports.wbg.__wbg_instanceof_HtmlCanvasElement_2ea67072a7624ac5 = function(arg0) {
    let result;
    try {
      result = arg0 instanceof HTMLCanvasElement;
    } catch (_) {
      result = false;
    }
    const ret = result;
    return ret;
  };
  imports.wbg.__wbg_instanceof_Window_def73ea0955fc569 = function(arg0) {
    let result;
    try {
      result = arg0 instanceof Window;
    } catch (_) {
      result = false;
    }
    const ret = result;
    return ret;
  };
  imports.wbg.__wbg_length_a446193dc22c12f8 = function(arg0) {
    const ret = arg0.length;
    return ret;
  };
  imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
    const ret = new Error();
    return ret;
  };
  imports.wbg.__wbg_new_a12002a7f91c75be = function(arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
  };
  imports.wbg.__wbg_newnoargs_105ed471475aaf50 = function(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return ret;
  };
  imports.wbg.__wbg_newwithu8clampedarrayandsh_7ea6ee082a25bc85 = function() {
    return handleError(function(arg0, arg1, arg2, arg3) {
      const ret = new ImageData(getClampedArrayU8FromWasm0(arg0, arg1), arg2 >>> 0, arg3 >>> 0);
      return ret;
    }, arguments);
  };
  imports.wbg.__wbg_putImageData_4c5aa10f3b3e4924 = function() {
    return handleError(function(arg0, arg1, arg2, arg3) {
      arg0.putImageData(arg1, arg2, arg3);
    }, arguments);
  };
  imports.wbg.__wbg_set_65595bdd868b3009 = function(arg0, arg1, arg2) {
    arg0.set(arg1, arg2 >>> 0);
  };
  imports.wbg.__wbg_setheight_da683a33fa99843c = function(arg0, arg1) {
    arg0.height = arg1 >>> 0;
  };
  imports.wbg.__wbg_settextContent_d29397f7b994d314 = function(arg0, arg1, arg2) {
    arg0.textContent = arg1 === 0 ? void 0 : getStringFromWasm0(arg1, arg2);
  };
  imports.wbg.__wbg_setwidth_c5fed9f5e7f0b406 = function(arg0, arg1) {
    arg0.width = arg1 >>> 0;
  };
  imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
    const ret = arg1.stack;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbg_static_accessor_GLOBAL_88a902d13a557d07 = function() {
    const ret = typeof global === "undefined" ? null : global;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0 = function() {
    const ret = typeof globalThis === "undefined" ? null : globalThis;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_static_accessor_SELF_37c5d418e4bf5819 = function() {
    const ret = typeof self === "undefined" ? null : self;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_static_accessor_WINDOW_5de37043a91a9c40 = function() {
    const ret = typeof window === "undefined" ? null : window;
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
  };
  imports.wbg.__wbg_width_4f334fc47ef03de1 = function(arg0) {
    const ret = arg0.width;
    return ret;
  };
  imports.wbg.__wbg_width_5dde457d606ba683 = function(arg0) {
    const ret = arg0.width;
    return ret;
  };
  imports.wbg.__wbg_width_b0c1d9f437a95799 = function(arg0) {
    const ret = arg0.width;
    return ret;
  };
  imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
  };
  imports.wbg.__wbindgen_init_externref_table = function() {
    const table3 = wasm.__wbindgen_export_2;
    const offset2 = table3.grow(4);
    table3.set(0, void 0);
    table3.set(offset2 + 0, void 0);
    table3.set(offset2 + 1, null);
    table3.set(offset2 + 2, true);
    table3.set(offset2 + 3, false);
    ;
  };
  imports.wbg.__wbindgen_is_undefined = function(arg0) {
    const ret = arg0 === void 0;
    return ret;
  };
  imports.wbg.__wbindgen_memory = function() {
    const ret = wasm.memory;
    return ret;
  };
  imports.wbg.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  return imports;
}
__name(__wbg_get_imports, "__wbg_get_imports");
function __wbg_init_memory(imports, memory) {
}
__name(__wbg_init_memory, "__wbg_init_memory");
function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;
  cachedDataViewMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  cachedUint8ClampedArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}
__name(__wbg_finalize_init, "__wbg_finalize_init");
function initSync(module) {
  if (wasm !== void 0) return wasm;
  if (typeof module !== "undefined") {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module);
    } else {
      console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
    }
  }
  const imports = __wbg_get_imports();
  __wbg_init_memory(imports);
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module);
}
__name(initSync, "initSync");
async function __wbg_init(module_or_path) {
  if (wasm !== void 0) return wasm;
  if (typeof module_or_path !== "undefined") {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  __wbg_init_memory(imports);
  const { instance, module } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module);
}
__name(__wbg_init, "__wbg_init");
var photon_rs_default = __wbg_init;
async function initPhoton(input) {
  if (initPhoton.initialized) {
    throw new Error("(@cf-wasm/photon): Function already called. The `initPhoton()` function can be used only once.");
  }
  if (!input) {
    throw new Error("(@cf-wasm/photon): Argument `input` is not valid.");
  }
  initPhoton.initialized = true;
  initPhoton.promise = (async () => {
    const output = await photon_rs_default(await input);
    initPhoton.ready = true;
    return output;
  })();
  return initPhoton.promise;
}
__name(initPhoton, "initPhoton");
initPhoton.sync = (input) => {
  if (initPhoton.initialized) {
    throw new Error("(@cf-wasm/photon): Function already called. The `initPhoton()` function can be used only once.");
  }
  if (!input) {
    throw new Error("(@cf-wasm/photon): Argument `input` is not valid.");
  }
  initPhoton.initialized = true;
  const output = initSync(input);
  initPhoton.promise = Promise.resolve(output);
  initPhoton.ready = true;
  return output;
};
initPhoton.promise = null;
initPhoton.initialized = false;
initPhoton.ready = false;
initPhoton.ensure = async () => {
  if (!initPhoton.promise) {
    throw new Error("(@cf-wasm/photon): Function not called. Call `initPhoton()` function first.");
  }
  return initPhoton.promise;
};

// node_modules/.pnpm/@cf-wasm+photon@0.2.1/node_modules/@cf-wasm/photon/dist/workerd.js
import photonWasmModule from "lib/photon_rs_bg.wasm";
initPhoton.sync({ module: photonWasmModule });

// src/service.ts
var ImageProxy = class extends WorkerEntrypoint {
  static {
    __name(this, "ImageProxy");
  }
  // Currently, entrypoints without a named handler are not supported
  async fetch() {
    return new Response(null, { status: 404 });
  }
  async transform(file, scale2) {
    const inputImage = PhotonImage.new_from_image(file);
    const outputImage = resize(inputImage, inputImage.get_width() * (scale2 / 100), inputImage.get_height() * (scale2 / 100), SamplingFilter.Nearest);
    const outputBytes = outputImage.get_bytes_webp();
    inputImage.free();
    outputImage.free();
    return new Response(outputBytes, {
      headers: {
        "Content-Type": "image/webp"
      }
    });
    return file;
  }
};
export {
  ImageProxy as default
};
/*! Bundled license information:

@cf-wasm/photon/dist/chunk-XSJYIU2V.js:
  (*! Needed to remove these lines in order to make it work on next.js *)
  (*! Needed to remove these lines in order to make it work on node.js *)
*/
//# sourceMappingURL=service.js.map
