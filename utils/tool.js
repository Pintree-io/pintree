const fs = require('fs')
const path = require('path')

function combineJson(renameByFileName = true) {
  const jsonFiles = fs.readdirSync(path.join(process.cwd(), 'combine'))
  const tempPintree = jsonFiles.reduce((tempPintree, file) => {
    const filePath = path.join(process.cwd(), `combine/${file}`)
    const data = fs.readFileSync(filePath, 'utf8')
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
  return tempPintree
}

// If want to rename bookmark list by file name , set renameByFileName to true
const data = combineJson();

fs.unlinkSync('json/pintree.json')
try {
  fs.mkdirSync(path.join(process.cwd(), 'json'))
} catch (error) {
  // file already exists
}
fs.writeFileSync(path.join(process.cwd(), 'json/pintree.json'), JSON.stringify(data, null, 2), 'utf8')
