function quickChangeRecord(functions, fields, gcProperty, matchVal, matchOn){
    let resultStr = "";
    let isRd = false;
    let currentDataToSet = `""`;
    let fieldName = fields[0];
    fieldName = getFieldName(fieldName);
    for(let i=0; i<functions.length; i++){
        currentDataToSet = `""`;
        if(i-1<fields.length){
            if(i===1 && matchVal!=""){
                currentDataToSet = matchVal+` fv!row['${recordObj[fields[i-1]]}'] ` +matchOn;
            }
            else{
                currentDataToSet = ` fv!row['${recordObj[fields[i-1]]}'] `;
            }
        }
        // console.log(`functions:${functions[i]}`);
        if(i===0){
            resultStr+= `\t-${functions[i]}{`;
            if(/rd/g.exec(functions[i])){
                isRd=true;
            }
        }
        
        else{
            if(isRd===true && i<functions.length-1){
                resultStr+= `\n\t\t-${functions[i]}{\n\t\t\t${currentDataToSet}\n\t\t},`+"\n\t\tchar(10),\t\t";
            }
            else{
                resultStr+= `\n\t\t-${functions[i]}{\n\t\t\t${currentDataToSet}\n\t\t},`;
            }
        }
    }
    resultStr = gcProperty+"{\n"+resultStr+"\n\t}"+`\n}.$l."${fieldName}"`;
    return resultStr;
}


function getGridFunctionRecord(data){
    let matchRegex = /\$m\.\w+\!\w+\.\w+\.\w+\s*\-{0,1}\w*/g;
    let matchVal = matchRegex.exec(data)?data.match(matchRegex)[0]:""; 
    matchVal = matchVal.replace(/\$m\./g, "$match ");
    let matchOn = /\-\w+/g.exec(matchVal)?matchVal.match(/\-\w+/g)[0]:"";
    matchVal = matchVal.replace(/\-\w+/g,"");
    
    data = data.replace(matchRegex,"");
    
    console.log(matchVal);
    data = data.replace(/\,\s*/g,",");
    console.log(data);
    data = data.replace(/\s+$/g,"");
    data = data.replace(/\s+/g," ");
    
    data = data.split(" ");
    
    let fields = data[0].split(",");
    let functions = data.length>1?data[1].replace(/\-/g,"").replace(/\>/g,","):"rd,rt";
    functions = functions.split(",");
    console.log(functions);
    console.log(fields);
    let gcRegex = /-gc\.(\w+(?:\.\w+|\w+\#\w+)+)/g;
    let gcProperty = gcRegex.exec(data)?data.match(gcRegex)[0]:"-gc.at.l";
    
    result = "";
    
    return quickChangeRecord(functions, fields, gcProperty, matchVal, matchOn);
}

const generateGridCodeForRecords=()=>{
    var result = codeEditor.getValue();
    result = result.replace(/^\s+/gm, ' ');
    result = result.replace(/\s+$/g, '');
    result = result.split("\n").map((x)=>{return getGridFunctionRecord(x)}).join(",\n");

    codeEditor.setValue(result);
}

// data = `statusId, accountNo -rd.c->rt.st.mm,-rt.st.mm, -ri.mm  $m.local!masterData.name.id -int`;

// console.log(getGridFunction(data));

// gcProperty+"{\n"+functions.map((x, index, functions)=>{return index===0?`-${x}{`: `\n-${x}{\n$fv!row.${fields[index-1]}\n},`}).join("")+"\n}"+"\n}"
