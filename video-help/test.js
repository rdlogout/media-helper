
const images=['https://miro.medium.com/v2/resize:fit:720/format:png/1*59n02vdsMK017dwfiImAEQ.png']

const testTf=async(url)=>{
    let start=performance.now();
    let res=await fetch(url);
    let end=performance.now();
    return end-start;
}

const wasm=async(url)=>{
   return testTf(`https://my-app.base15log.workers.dev/img?img=${url}&scale=1`)
}

const cont=async(url)=>{
    return testTf(`https://image.base15log.workers.dev/?url=${url}`)
}
 

for(let image of images){
    const [wasmTime,contTime]=await Promise.all([wasm(image),cont(image)]);
    console.table({image,wasmTime,contTime});
}