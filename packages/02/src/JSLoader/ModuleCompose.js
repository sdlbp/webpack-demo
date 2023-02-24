/**
 * 组装 Component 和 store， 使得此模块可以从一个统一出口植入到父项目中
 * 隔离 module 内部的 store 数据， 避免增加整个项目 store 负担， 原则上 submodule store 不暴露到外部
 * 当加载到这个路由时才同时加载 component 和 store 的资源
 *
 * Usage:
 *  import ModuleCompose from 'path/to/ModuleCompose'
 *
 *  const compose = new ModuleCompose(import('path/to/store'))
 *
 *  const views = {
 *    view: compose.build(() => import('path/to/view'))
 *  }
 *  export {
 *    views
 *  }
 *
 * */
import React from 'react';
import { Provider } from 'mobx-react';

const injectStore = (RenderComponent, rawStore, proxyReady) => {
  class InjectStore extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = { ready: false };
      this.init();
    }

    static loadable = true

    async init() {
      await proxyReady;
      const [Comp, store] = await Promise.all([
        RenderComponent(), rawStore()
      ]);
      Object.assign(this, { Comp: Comp.default, store });
      this.setState({ ready: true });
    }

    render() {
      const { ready } = this.state;
      const { store, Comp, props } = this;
      return ready ? (
        <Provider {...store}>
          <Comp {...props} />
        </Provider>
      ) : null;
    }
  }
  return InjectStore;
};

export default class ModuleCompose {
  constructor(store, proxyReady) {
    this.store = store;
    this.proxyReady = proxyReady;
  }

  build(Component) {
    return injectStore(Component, this.store, this.proxyReady);
  }
}
