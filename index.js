const utils = require('loader-utils')
const preprocessor = require('./preprocess/lib/preprocess')

const ERRORS = {
  html: `条件编译失败,参考示例(注意 ifdef 与 endif 必须配对使用):
<!--  #ifdef  %ENV% -->
模板代码
<!--  #endif -->
`,
  js: `条件编译失败,参考示例(注意 ifdef 与 endif 必须配对使用):
// #ifdef  %ENV%
js代码
// #endif
`,
  css: `条件编译失败,参考示例(注意 ifdef 与 endif 必须配对使用):
/*  #ifdef  %ENV%  */
css代码
/*  #endif  */
`
}

module.exports = function (source, map) {
  this.cacheable && this.cacheable()

  let types = utils.getOptions(this).type || 'js'
  const context = utils.getOptions(this).context || {}
  let content = source
  let error = null
  if (!Array.isArray(types)) {
    types = [types]
  }
  types.forEach(type => {
    try {
      content = preprocessor.preprocess(content, context, {
        type
      })
    } catch (e) {
      error = new Error(ERRORS[type])
      // logger.error(error)
    }
  })
  this.callback(error, content, map)
}
