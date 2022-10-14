const nodeOps = {
  insert(child, parent) {
    parent.appendChild(child)
  },
  createElement(tag, text) {
    const el = document.createElement(tag);
    el.textContent = text;
    return el;
  }
}

const rendererOptions = nodeOps;

// -------------------- runtime-core -----------------------

function createRenderer(nodeOps) {
  let comp = null;
  function mount(root) {
    const currEl = nodeOps.createElement(comp.type, comp.children);
    nodeOps.insert(currEl, root);
  }

  return {
    createApp(component) {
      comp = component;
      return {
        mount
      }
    }
  }
}


// ---------------------- runtime-dom ---------------------------
function ensureRenderer() {
  return createRenderer(rendererOptions);
}

function createApp(...args) {
  return ensureRenderer().createApp(...args)
}

createApp({type: "div", children: "test"}).mount(document.getElementById("app"))