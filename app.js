//Data Encapsulation: allows us to hide to the implementation details of the specific module from the outside scope so we     only  expose a public interface which is some times called an API.


//BUDGET CONTROLLER
var budgetController = ( function() {
    
    var Expenses = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expenses.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expenses.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        
        data.totals[type] = sum;
    };
    
    
    var data = {
        
        allItems: {
            exp: [],
            inc: []
        },
        
        totals: {
            exp: 0,
            inc: 0
        },
        
        budget: 0,
        percentage: 0
        
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // [1 2 3 4 5], next ID = 6
            // [1 2 3 6 8], next ID = 9
            // ID = last ID + 1;
            
            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; 
            } else {
                ID = 0;
            }
            
            //Create new item based on 'exp or 'inc' type
            if (type === 'exp') {
                newItem = new Expenses(ID, des, val);
            } else if (type === 'inc') {
                 newItem = new Income(ID, des, val);
            }
            
            
            //Push it into our data structures
            data.allItems[type].push(newItem);
            
            //Return new Item
            return newItem;
            
        },
        
        deleteItem: function(type, id) {
            var index, ids;
            
            //id = 6
            //ids = [1, 3 5 6 8]
            //index = [3]
            
            ids = data.allItems[type].map(function(current) { //Map is similar to forEach method except it returns a brand                                                       new array.
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget:  function() {
            
            //Calculate the total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');
            
            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
                       
            //Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }

        },
        
        calculatePercentages: function() {
            
            /*
            a = 10
            b = 20
            c = 30
            income = 100
            a = (10 / 100) * 100
            b = (20 / 100) * 100
            c = (30 / 100) * 100
            */
            
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function() {
            
            var allPer = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            })
            return allPer;
        },
        
        getBudget: function() {
            
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp   
            }
        }, 
        
        testing: function() {
            console.log(data);
        }
    }
       
})();



//UI CONTROLLER
var UIController = ( function() {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputAdd: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    }
    
    var formatNumber = function(num, type) {
        /*
        + pr - before number
        exactly two decimal points
        comma separating the thousands
             
             
        2522.4569 -> 2,522.46
        2000 -> 2,000.00 
        */  
            
        num = Math.abs(num);
        num = num.toFixed(2);
            
        numSplit = num.split('.');
            
        int = numSplit[0];
            
        if (int.length > 3) {
            
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);  //input 23510, output 23,510
        }   
        
            
        dec = numSplit[1];
                    
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
                
    };
    
    var nodeListForEach = function(list, callBack) {
        for (var i = 0; i < list.length; i++) {
            callBack(list[i], i);
        }
    };
    
    
    return {  //returning an object.
        
        getInput: function() {
            
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            
            //Create HTML string with placeholder text
            if (type === 'inc') {
                
                element = DOMStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            
            } else if (type === 'exp') {
                
                element = DOMStrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            }
             
            //Replace placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //Insert the HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el); //removeChild method removes the child element or node in DOM tree.
            
        }, 
        
        clearFields: function() {
            
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ' ,' + DOMStrings.inputValue);//selects all query in a list.
            
            fieldsArr = Array.prototype.slice.call(fields); //recieves a list and gives an array.
            
            
            fieldsArr.forEach(function(current, index, array) {
                
                current.value = "";
            });
            
            fieldsArr[0].focus();
            
        },
        
        displayBudget: function(obj) {
            
            var type;
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '----';
            }
        },
        
        displYPercentages: function(percentage) {
             
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                current.textContent = percentage[index] + '%';
            });
        },
        
        displayMonth: function() {
            var now, year, months, month;
            
            
            now = new Date();  //Creates date instances
            
            year = now.getFullYear(); //return the year of the current date and time.
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            month = now.getMonth(); //returns the month of the current date and time.
            
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
               DOMStrings.inputType + ',' +
               DOMStrings.inputDescription + ',' +
               DOMStrings.inputValue 
                
            );
            
            nodeListForEach(fields, function(cur) {
                
                cur.classList.toggle('red-focus');
                
            });
            
            document.querySelector(DOMStrings.inputAdd).classList.toggle('red');
        },
        
        getDOMStrings: function() {
            return DOMStrings;
        }
    };
    
    
})();



//GLOBAL APP CONTROLLER
var controller = ( function(budgetCtrl, UICtrl) {
    
    var setEventlistener = function() {
        
        var DOM = UICtrl.getDOMStrings(); //storing the object returned from the UI Controller function.
        
        document.querySelector(DOM.inputAdd).addEventListener('click', ctrlAddItem);
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    
        document.addEventListener('keypress', function(event) {
        
            if (event.keyCode === 13 || event.which === 13) { 

                ctrlAddItem();
            }
    });
      
        
    };
    
    var updateBudget = function() {
        
        //1. Calculate the budget.
        budgetCtrl.calculateBudget();
        
              
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        
        //3. Display the budget on the UI.
        UICtrl.displayBudget(budget);
        
    }
    
    var updatePercentages = function() {
        
        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();
        
        
        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        
        //3. Update the UI with new percentages
        UICtrl.displYPercentages(percentages);
        
    }
    
    
    var ctrlAddItem = function() {
        var input, newItem;
        
         //1. Get the field input data.
        var input = UICtrl.getInput();
        
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
            //2. Add the item to the budget controller.
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
        
            //3. Add the item to the UI.
            UICtrl.addListItem(newItem, input.type);


            //4. Clear the fields
            UICtrl.clearFields();
            
            
            //5. Calculate and update the budget
            updateBudget();
            
            //6. Calculate and update the percentages.
            updatePercentages();
                        
        } 
    };
    
    var ctrlDeleteItem = function(event) { 
        var itemID, splitID, ID, type;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; //parentNode returns the parent element/node                                                                           in the DOM tree.
        
        if (itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];    //splits a string sentence into an array.
            ID = parseInt(splitID[1]);
            
            
            //1. Delete the item from the data structure.
            budgetCtrl.deleteItem(type, ID);


            //2. Delete the item from the UI.
            UICtrl.deleteListItem(itemID);


            //3. Update and show the new budget.
            updateBudget();
            
            
            //4. Calculate and update the percentages.
            updatePercentages();
        } 
        
        
    };

    return {
        init: function() {
            
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,         
                percentage: -1,
                totalInc: 0,
                totalExp: 0 
            });
            setEventlistener();
        }
    };
    
    
    
})(budgetController, UIController);

controller.init();































