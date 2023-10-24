function getGridLayoutHeaderCell(fieldName) {
    return `\t\t\ta!gridLayoutHeaderCell(label: "${getFieldName(fieldName)}")`;
}
function getGridLayoutColumnConfig() {
    return `\t\t\ta!gridLayoutColumnConfig(width: "DISTRIBUTE")`;
}
function getGridRowItem(functions, fields, matchVal, matchOn, isChaining) {
    let resultStr = "";
    let isRd = false;
    let currentDataToSet = `""`;
    let fieldName = fields[0];

    if (isChaining) {
        for (let i = 0; i < functions.length; i++) {
            currentDataToSet = `""`;
            if (i - 1 < fields.length) {
                if (i === 1 && matchVal != "") {
                    currentDataToSet = matchVal + ` fv!item.${fields[i - 1]} ` + matchOn;
                }
                else {
                    currentDataToSet = `$fv!item.${fields[i - 1]}`;
                }
            }
            // console.log(`functions:${functions[i]}`);
            if (i === 0) {
                resultStr += `\t-${functions[i]}{`;
                if (/rd/g.exec(functions[i])) {
                    isRd = true;
                }
            }

            else {
                if (isRd === true && i < functions.length - 1) {
                    resultStr += `\n\t\t-${functions[i]}{\n\t\t\t${currentDataToSet}\n\t\t},` + "\n\t\tchar(10),\t\t";
                }
                else {
                    resultStr += `\n\t\t-${functions[i]}{\n\t\t\t${currentDataToSet}\n\t\t},`;
                }
            }
        }
        resultStr = resultStr + `\n}.$l."${getFieldName(fieldName)}"`;
        return resultStr;
    }
    else {
        if (functions[0] == 'dd') {
            resultStr = `-${functions[0]}{
                placeholder: "--Select ${getFieldName(fieldName)}--",
                $v fv!item.${fieldName},
              }`
        }
        else if (functions[0] == "rb") {
            resultStr =  `$rb fv!item.${fieldName}`;
        }
        else if (functions[0] == "cb") {
            resultStr = `$cb fv!item.${fieldName}`;
        }
        else{
            resultStr =  `-${functions[0]}{
                $v fv!item.${fieldName},
              }`
        }
        resultStr = resultStr + `.$l."${fieldName}"`;
        return resultStr;
    }

}


function getGridRowLayout(data) {
    let matchRegex = /\$m\.\w+\!\w+\.\w+\.\w+\s*\-{0,1}\w*/g;
    let matchVal = matchRegex.exec(data) ? data.match(matchRegex)[0] : "";
    matchVal = matchVal.replace(/\$m\./g, "$match ");
    let matchOn = /\-\w+/g.exec(matchVal) ? matchVal.match(/\-\w+/g)[0] : "";
    matchVal = matchVal.replace(/\-\w+/g, "");

    data = data.replace(matchRegex, "");

    console.log(matchVal);
    data = data.replace(/\,\s*/g, ",");
    console.log(data);
    data = data.replace(/\s+$/g, "");
    data = data.replace(/\s+/g, " ");

    let chainingRegex = /\-\>/;
    let isChaining = chainingRegex.exec(data) ? true : false;
    console.log(isChaining);
    data = data.split(" ");
    console.log(data);

    let fields = data[0].split(",");
    console.log(fields);
    let functions = data.length > 1 ? data[1].replace(/\-/g, "").replace(/\>/g, ",") : "rd,rt";
    functions = functions.split(",");
    console.log(functions);

    result = "";

    return getGridRowItem(functions, fields, matchVal, matchOn, isChaining);
}

const generateGridLayoutForCDTs = () => {
    var result = codeEditor.getValue();
    result = result.replace(/^\s+/gm, ' ');
    result = result.split("\n");
    let gridHeader = result.map((x) => { return getGridLayoutHeaderCell(x.split(" ")[0]) }).join(",\n");
    let girdConfig = result.map((x) => { return getGridLayoutColumnConfig(x) }).join(",\n");
    let gridItems  = result.map((x) => { return getGridRowLayout(x) }).join(",\n");
    let gridRowLayout = `<div>a!gridRowLayout(
        contents: {`+"\n"+gridItems+"\n}\n)</div>";
    let gridRows =  `<div>a!forEach(
        items: local!items,
        expression:${gridRowLayout}\n)</div>`;
    
    result = `<div>a!gridLayout(\n\t<div>headerCells: {\n${gridHeader}\n\t},</div>\n \t<div>columnConfigs: {\n${girdConfig}\n\t},</div>\n${gridRows})</div>`;    

    codeEditor.setValue(result);
}

// data = `statusId, accountNo -rd.c->rt.st.mm,-rt.st.mm, -ri.mm  $m.local!masterData.name.id -int`;

// console.log(getGridFunction(data));

// gcProperty+"{\n"+functions.map((x, index, functions)=>{return index===0?`-${x}{`: `\n-${x}{\n$fv!row.${fields[index-1]}\n},`}).join("")+"\n}"+"\n}"
