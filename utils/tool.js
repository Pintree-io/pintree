const fs = require('fs')
const path = require('path')

function combineJson(renameByFileName = true) {
  let jsonFiles = fs.readdirSync(path.join(process.cwd(), 'combine'))
  let tempPintree = jsonFiles.reduce((tempPintree, file) => {
    let filePath = path.join(process.cwd(), `combine/${file}`)
    let data = fs.readFileSync(filePath, 'utf8')
    let jsonData = JSON.parse(data)

    if (renameByFileName) {
      if (jsonData.length === 1) {
        jsonData[0].title = filePath.split('/').pop().replace('.json', ``)
      } else {
        jsonData.forEach((item, ind) => {
          item.title = filePath.split('/').pop().replace('.json', `-${ind + 1}`)
        })
      }
    }
    jsonData = jsonData.sort((a, b) => a.title.localeCompare(b.title))

    return tempPintree.concat(jsonData)
  }, [])
  wirteDataToJsonFile(tempPintree)
}

function wirteDataToJsonFile(data, filePath = 'json') {
  deleteDirRecursive(path.join(process.cwd(), filePath))

  fs.mkdirSync(path.join(process.cwd(), filePath))

  fs.writeFileSync(path.join(process.cwd(), `${filePath}/pintree.json`), JSON.stringify(data, null, 2), 'utf8')
}

function deleteDirRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDirRecursive(curPath)
      } else {
        fs.unlinkSync(curPath)
      }
    });
    fs.rmdirSync(dirPath)
  }
}

// If want to rename bookmark list by file name , set renameByFileName to true
combineJson()
// combineJson(true)
