class Test {
    constructor() {
        console.log('02 test')
    }
}

Test.childrenCom = {
    a: () => import('./A'),
    b: () => import('./B'),
    c: () => import('./C'),
}

const test = new Test();
Test.childrenCom.a();
Test.childrenCom.b();
Test.childrenCom.c();

export default Test;