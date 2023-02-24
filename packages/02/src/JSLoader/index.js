import React from 'react';
import ModuleCompose from './ModuleCompose';

function scriptLoader(url, name, name1) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  // 获取返回的模块
  const resultModule = () => {
    let result = window[name];
    if (!result) {
      result = window[name1];
    }
    return result;
  };

  const instance = new Promise((resolve) => {
    if (script.readyState) {
      // IE
      script.onreadystatechange = () => {
        // eslint-disable-next-line
        if (script.readyState === 'loaded' || script.readyState === 'complete') {
          script.onreadystatechange = null;
          resolve(resultModule());
        }
      };
    } else {
      // Others: Firefox, Safari, Chrome, and Opera
      script.onload = () => {
        resolve(resultModule());
      };
    }
  });
  script.src = url;
  document.body.appendChild(script);
  return instance;
}

const getStateView = ({ viewName, name, loader }) => {
  class StateView extends React.PureComponent {
    Comp = null;

    constructor(props) {
      super(props);
      this.state = { ready: false };
      this.name = name;
      this.init();
    }

    static loadable = true;

    async init() {
      const loadedModule = await loader;
      const { views, store, proxy } = loadedModule;
      const {
        config: { store: proxyStore },
      } = proxy;
      const mergeStore = async () => {
        const rStore = await store();
        return {
          ...proxyStore,
          ...rStore.default,
        };
      };
      const compose = new ModuleCompose(mergeStore, proxy.ready);
      Object.assign(this, {
        Comp: compose.build(views[viewName]),
      });
      this.setState({ ready: true });
    }

    render() {
      const { ready } = this.state;
      const { Comp } = this;
      return ready ? <Comp /> : null;
    }
  }
  return StateView;
};

class JSLoader {
  constructor({ url, name, name1, config }) {
    this.name = name; // 模块导出的包名
    this.name1 = name1; // 备用导出包名
    this.config = config;
    this.module = scriptLoader(url, name, name1);
    this.init();
  }

  async init() {
    const loadedModule = await this.module;
    loadedModule && loadedModule.proxy && loadedModule.proxy.setConfig(this.config);
  }

  getView(viewName) {
    return getStateView({ viewName, name: this.name, loader: this.module });
  }
}

export default JSLoader;
