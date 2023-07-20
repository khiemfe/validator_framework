function Validator(options) {
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    var selectorRules = {}

    function validate(inputElement, rule) { //inputElenment là lấy ra cái thẻ input
                                            // còn rule là lấy ra rules con để thực hiện hàm bên dưới
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        
        // Lấy ra các rules của selector dựa theo id, nếu id ko trùng thì nó bằng 1, nếu trong mảng selectorRules có 2 id giống nhau thì lấy ra cả 2 cái
        var rules = selectorRules[rule.selector];
        // var errorMessage = rule.test(inputElement.value) //inputElement.value là value mà ng dùng nhập vào
        var errorMessage 

        // Lặp qua từng rule & kiểm tra
        // Nếu có lỗi thì dừng việc kiểm
        for (var i = 0; i < rules.length; ++i) {
            switch(inputElement.type) {
                case 'radio':
                // case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break;
                default: 
                    errorMessage = rules[i](inputElement.value)
            }
            
            if (errorMessage) break;
        }
        if(errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        return errorMessage
    }

    var formElement = document.querySelector(options.form)
    if(formElement) {
        options.rules.forEach(function(rule) {
            // Lưu lại các rules cho mỗi input, khi nó trùng id với nhau thì nó mới nằm chung mảng vì ta dùng selectorRules[rule.selector]
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else { // ban đầu thì nó sẽ gán này trước và sau đó nếu nó trùng lại id thì nó chạy lên phía trên if chứ ko xuống else
                selectorRules[rule.selector] = [rule.test];
            }
    
            var inputElements = formElement.querySelectorAll(rule.selector)
            inputElements.forEach(function(inputElement){
                inputElement.onblur = function() {
                    validate(inputElement, rule)
                }
                inputElement.oninput = function() {
                    // var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    // errorElement.innerText = ''
                    // getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                    //or
                    validate(inputElement, rule)
                }
            })
        })
        
        formElement.onsubmit = function(e) {
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(function(rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if(isValid) {
                    isFormValid = false
                }
            })
            if(isFormValid) {
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {

                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name=' + input.name + ']:checked').value
                                break
                            case 'checkbox':
                                
                                if(input.matches(':checked')){
                                    if(!Array.isArray(values[input.name])) {
                                        values[input.name] = []
                                    }
                                    values[input.name].push(input.value)
                                } else {
                                    if(!Array.isArray(values[input.name])) {
                                        values[input.name] = ''
                                    }
                                }
                                break
                            default:
                                values[input.name] = input.value;
                        }
                        return values
                    }, {})
                    options.onSubmit(formValues);
                } else {
                    formElement.submit();
                }
            }
        }
    }
    
}



// Định nghĩa rules
// Nguyên tắc của các rules:
// 1. Khi có lỗi => Trả ra message lỗi
// 2. Khi hợp lệ => Không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined :  message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined :  message || 'Trường này phải là email';
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined :  message || `Vui lòng nhập tối thiểu ${min} kí tự`;
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}