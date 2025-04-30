(function(){
    function newScript(url,onload){
        const script=window.document.createElement('script');
        script.src=url;
        window.document.body.append(script);
        script.addEventListener('load',function(){
            onload();
        },{once:true});
        script.addEventListener('error',function(e){
            alert('Something Error!');
        },{once:true});
    }
    function downloadBlob(blob,filename=''){
        const a=window.document.createElement('a');
        const url=URL.createObjectURL(blob);
        a.href=url;
        a.download=filename;
        a.click();
        setTimeout(()=>{
            URL.revokeObjectURL(url);
        },1000);
    }
    const download=async function(){
        try{
            const req=await fetch('mooc_sysbar.php')
            let el=document.createElement( 'html' );
            el.innerHTML=await req.text();
            let cid=el.getElementsByTagName('select')[0].value;
            if(cid==='10000000'){
                cid=prompt('請輸入您想下載的課程代碼:');
            }
            let req=await fetch(`https://istudy.ntut.edu.tw/xmlapi/index.php?action=my-course-path-info&onlyProgress=0&descendant=1&cid=${cid}`);
            if(req.ok){
                const data=await req.json();
                if(data.message==='success'){
                    if(confirm(`您選擇的課程為: ${data.data.path.text} ,是否下載:`)){
                        const blobWriter=new zip.BlobWriter("application/zip");
                        const writer=new zip.ZipWriter(blobWriter);
                        const items=data.data.path.item;
                        for(let i=0;i<items.length;i++){
                            if(/^http/.test(items[i].href)){
                                try{
                                    req=await fetch(items[i].href);
                                    if(req.ok){
                                        const blob=await req.blob();
                                        await writer.add(`${items[i].text}.${items[i].href.split('.').pop()}`, new zip.BlobReader(blob));
                                    }else{
                                        throw Error();
                                    }
                                }catch(e){
                                    console.error(`第 ${i+1} 個檔案: ${items[i].text} 下載失敗!`);
                                }
                            }
                        }
                        await writer.close();
                        const blob=await blobWriter.getData();
                        downloadBlob(blob,`${data.data.path.text}.zip`);
                        alert('下載完成!!!');
                    }else{
                        alert('下載取消!');
                    }
                }else{
                    throw Error();
                }
            }else{
                throw Error();
            }
        }catch(e){
            alert('Something Error!');
            console.log(e)
        }
    }
    if(!window.downloadFile){
        newScript(`https://t112360140.github.io/CDN/zip.min.js`,()=>{
            window.downloadFile=download;
        });
    }
})();
