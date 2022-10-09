const weakMap = new WeakMap();
// 表示当前激活的effect
let activeEffect = null;

/**
 * 进行依赖收集
 * @param target 数据源
 * @param key 依赖收集的属性
 */
function track(target, key) {
  let depsMap = weakMap.get(target);
  if (!depsMap) {
    weakMap.set(target, (depsMap = new Map()));
  }

  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }

  deps.add(activeEffect);
  (activeEffect.deps || (activeEffect.deps = [])).push(deps)
}

/**
 * 进行依赖触发
 * @param target 数据源
 * @param key 触发修改的属性
 */
function trigger(target, key) {
  let depsMap = weakMap.get(target);
  if (!depsMap) return;

  let deps = depsMap.get(key);
  if (!deps) return;

  const fns = new Set(deps);

  fns.forEach(fn => fn())
}

function cleanEffect(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i += 1) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn);
  }

  effectFn.deps.length = 0;
}

function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn;
    // 在调用渲染之前将effect清空。
    cleanEffect(effectFn);
    fn();
  }
  effectFn.deps = [];
  effectFn();
}

function reactive(target = {}) {
  return new Proxy(target, {
    get(target, key, receiver) {
      if (activeEffect) track(target, key);
      return Reflect.get(target, key, receiver);
    },

    set(target, key, value, receiver) {
      Reflect.set(target, key, value, receiver);
      trigger(target, key);
    },
  });
}

const proxyObj = reactive({flag: true, text: "这是一部分内容"})

function run() {
  document.getElementById("app").innerText = proxyObj.flag ? proxyObj.text : "not"
}
effect(run)

setTimeout(() => {
  proxyObj.flag = false;
}, 2000)

let counter = 0;
document.getElementById("btn").addEventListener("click", function () {
  proxyObj.text = `点击次数${++ counter}`
})

