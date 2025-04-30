import {Console} from "@woowacourse/mission-utils";
const OutputView = {
    printWelcome(day){
        Console.print("12월 " + day +"일에 우테코 식당에서 받을 이벤트 혜택 미리 보기!");
    }
    ,
    printMenu(menu) {
        Console.print("\n<주문 메뉴>");
        menu.forEach(function(n){
            Console.print(n.menuName + " " + n.quantity+"개");
        });
        // ...
    }
    ,
    printTotalPriceBeforeDiscount(price){
        Console.print("\n<할인 전 총주문 금액>");
        Console.print(price.toLocaleString() + "원");
    }
    ,
    printGiftMenu(giftValid){
        Console.print("\n<증정 메뉴>");
        if(giftValid)
            Console.print("샴페인 1개");
        else
            Console.print("없음");
    }
    ,
    printBenefit(discountString){
        Console.print("\n<혜택 내역>");
        if(!discountString || discountString.trim() === ""){
            Console.print("없음");
            return;
        }
        const output = discountString.split('원');
        output.forEach(function(n){
            if(n.trim() != '')
            Console.print(n+"원");
        });
    }
    ,
    printTotalBenefitPrice(totalDiscount){
        Console.print("\n<총혜택 금액>");
        if(totalDiscount===0){
            Console.print("없음");
            return;
        }
        Console.print("-"+totalDiscount.toLocaleString()+"원");
    }
    ,
    printTotalPriceAfterDiscount(total){
        Console.print("\n<할인 후 예상 결제 금액>");
        if(total===0){
            Console.print("없음");
            return;
        }
        Console.print(total.toLocaleString() + "원");
    }
    ,
    printEventBadge(badge){
        Console.print("\n<12월 이벤트 배지>");
        if(!badge || badge.trim() === ""){
            Console.print("없음");
            return;
        }
        Console.print(badge);
    }
    // ...
}
export default OutputView