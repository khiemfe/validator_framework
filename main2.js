function Validator(options) {
    formElement = document.querySelector(options.form)
    if(formElement) {
        options.rules.forEach(function (rule) {
            console.log(rule)
            var inputElement = formElement.querySelector(rule.selector)
                inputElement.onblur = function() {
                    var errorMessage = rule.test(inputElement.value)
                    console.log(errorMessage)
                }
        })
    }
}

Validator.isRequired = function(selector, message) {
    return{
        selector,
        test: function(value) {
            return value ? undefined :  message || 'Vui lòng nhập trường này'
        }

    } 
}