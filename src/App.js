import {Console} from "@woowacourse/mission-utils";
import InputView from "./InputView.js";
import OutputView from "./OutputView.js";
class App {
    
  async run() {
    /**
     * 할인, 출력, 총액 계산 등에서 활용되는 메뉴와 해당 메뉴의 타입, 가격을 담은 객체
     */
    const MENU = {
        "양송이수프": { type: "애피타이저", price: 6000 },
        "타파스": { type: "애피타이저", price: 5500 },
        "시저샐러드": { type: "애피타이저", price: 8000 },
      
        "티본스테이크": { type: "메인", price: 55000 },
        "바비큐립": { type: "메인", price: 54000 },
        "해산물파스타": { type: "메인", price: 35000 },
        "크리스마스파스타": { type: "메인", price: 25000 },
      
        "초코케이크": { type: "디저트", price: 15000 },
        "아이스크림": { type: "디저트", price: 5000 },
      
        "제로콜라": { type: "음료", price: 3000 },
        "레드와인": { type: "음료", price: 60000 },
        "샴페인": { type: "음료", price: 25000 },
    };

    //////////////////////////////////////////////////////////////////////////////
    //                          변수 선언 및 함수 호출부                           //
    //////////////////////////////////////////////////////////////////////////////

    /* 총 할인액 : 할인내용 계산 과정에서 여러 함수에서 값을 증가시킴 */
    let discount=0;

    /* 총 혜택내용 문자열 : 할인내용 계산 과정에서 여러 함수에서 문자열을 추가시킴
    ex)크리스마스 디데이 할인 : ---원특별할인 : ---원
    OutputView.js에서 '원' 기준으로 split해서 출력 */
    let totalBenefit = "";
                        
    /* 예외처리 거친 후 저장되는 날짜 입력값*/                    
    let date;

    /* 예외처리 거친 후 저장되는 메뉴명-수량*/
    let menu;

    /* 날짜 입력 예외처리 : 제대로 입력될 때 까지 반복 */
    while(true){
        try{
        const inputDate = await InputView.readDate();
        date = isDateValid(inputDate);
        break;
        }
        catch(e){
            Console.print("[ERROR] 유효하지 않은 날짜입니다. 다시 입력해 주세요.");
        }

    }

    /* 메뉴-수량 입력 예외처리 : 제대로 입력될 때 까지 반복 */
    while(true){
        try{
        const inputMenu = await InputView.readMenuAndNum();
        menu = parseOrderInput(inputMenu);
        break;
    }
        catch(e){
            Console.print("[ERROR] 유효하지 않은 주문입니다. 다시 입력해 주세요.");
        }
    }
    
    /* 할인받기 전 총액 계산하여 저장 */
    const TotalPriceBeforeDiscount = calcTotalPriceBeforeDiscount(menu);

    /* 증정품 제공여부 boolean으로 저장*/
    const giftValid = isGiftMenuValid();

    /* 크리스마스 디데이 할인액 */
    discount += christmasDdayDiscount();

    /* 평일|주말 할인액 */
    discount += dayDiscount();

    /* 특별 할인액*/
    discount += callenderDiscount();

    /* 증정품 할인액 */
    discount += giftMenuDiscount();

    /* 환영 문구 출력 */
    OutputView.printWelcome(date);
    /* <주문 메뉴> */
    OutputView.printMenu(menu);
    /* <할인 전 총주문 금액> */
    OutputView.printTotalPriceBeforeDiscount(TotalPriceBeforeDiscount);
    /* <증정 메뉴> */
    OutputView.printGiftMenu(giftValid);
    /* <혜택 내역> */
    OutputView.printBenefit(totalBenefit);
    /* <총혜택 금액> */
    OutputView.printTotalBenefitPrice(discount);

    /* <할인 후 예상 결제 금액>
        증정정품을 총혜택금액에만 반영하고 할인액에는 반영하지 않는 조건문 */
    if(isGiftMenuValid())
        OutputView.printTotalPriceAfterDiscount(TotalPriceBeforeDiscount-discount+25000);
    else
        OutputView.printTotalPriceAfterDiscount(TotalPriceBeforeDiscount-discount);

    /* <12월 이벤트 배지> */
    OutputView.printEventBadge(badge());


    ///////////////////////////////////////////////////////////////////////////////
    //                          함수 선언부                                       //
    //////////////////////////////////////////////////////////////////////////////


    function parseOrderInput(inputMenu){
        const seenMenus = new Set();
        const orders = inputMenu.split(',').map(order =>{   //','단위로 split해서 전달
            const [menuName, quantity] = order.split('-').map(str => str.trim());     //'-'단위로 쪼개서 menuName, quantity로 저장하여 예외 검사  
            if(!MENU[menuName]){        //메뉴판에 있는 메뉴인지 검사
                throw new Error();
            }
            if(isNaN(quantity) || Number(quantity) <= 0){       //수량 제대로 입력되었는지 검사
                throw new Error();   
            }
            if(seenMenus.has(menuName)){        //메뉴명 중복입력 검사
                throw new Error();
            }   seenMenus.add(menuName);
            
            return {menuName, quantity:Number(quantity)};
        });

        const isOnlyBeverage = orders.every(({menuName}) => MENU[menuName].type === "음료");        //모든 메뉴 타입이 "음료" 인지 검사
        if(isOnlyBeverage){
            throw new Error();
        }

        const  totalQuantity = orders.reduce((sum, {quantity}) => sum + quantity, 0);       //수량이 20 초과인지 검사
        if(totalQuantity>20){
            throw new Error();
        }
        return orders;      //검사 완료된 메뉴명-수량 객체 리턴
    }

    function isDateValid(inputDate){
        if (typeof inputDate !== 'string') {    //0으로 시작하는지 검사하기 위해 string타입으로 변환
            inputDate = String(inputDate);
        }
    
        if (/^0\d+/.test(inputDate)) {      //0으로 시작하는 숫자인지 검사
            throw new Error();
        }

        const numberInput = Number(inputDate);      //정수타입으로 변환
        
        if(isNaN(numberInput) || !Number.isInteger(numberInput) || numberInput<1 || numberInput>31){        // 비어있는지 || 정수인지 || 1과 31 사이인지 검사
            throw new Error();
        }
        return numberInput;     //검사 완료된 날짜 정수 리턴
    }

    function calcTotalPriceBeforeDiscount(menu){
        let total=0;
        menu.forEach(({menuName, quantity}) => {
            const price = MENU[menuName].price;
            total += price*quantity;        //메뉴 객체 순회하면서 메뉴가격*수량 증감
        });
        return total;       //할인 전 총금액 리턴
    }




    function isEventValid(){
        return TotalPriceBeforeDiscount>=10000;     //이벤트 제공 대상 여부 리턴
    }


    
    function isGiftMenuValid(){
        return (isEventValid()&&TotalPriceBeforeDiscount>=120000);      //증점품 제공 여부 리턴
    };

    
    function christmasDdayDiscount(){
        if(!isEventValid())
            return 0;
        if(date>=1 && date<=25){
            totalBenefit += "크리스마스 디데이 할인 : " + (-(1000+(date-1)*100)).toLocaleString() + "원";       //크리스마스 디데이 할인액 계산해서 문자열로 추가
            return 1000+(date-1)*100;       //이벤트 기간이면 할인액 리턴
        }
        return 0;       //이벤트 기간 아니면 0 리턴
    }

    
    function dayDiscount(){
        if(!isEventValid())
            return 0;
        let dayDiscountAmount=0;
        const discountTarget = ((date-1)%7 == 0 || (date-2)%7 == 0) ? "디저트" : "메인";        //주말||평일 여부 판단해서 할인type 계산
        menu.forEach(({menuName, quantity}) => {
            const type = MENU[menuName].type;
            if(type === discountTarget){
                dayDiscountAmount+=2023*quantity;       //메뉴객체 순회하면서 할인품목당 할인 적용
            }
        });
        totalBenefit += `${discountTarget === "디저트" ? "주말 할인" : "평일 할인"} : -${dayDiscountAmount.toLocaleString()}원`;        //주말||평일 할인액 계산해서 문자열로 추가
        return dayDiscountAmount;       //주말||평일 할인액 리턴
    }

    function callenderDiscount(){
        if(!isEventValid())
            return 0;
        if((date-3)%7===0 || date===25){        
            totalBenefit += "특별 할인 : -1,000원";
            return 1000;        //특별이벤트 날짜이면 문자열로 추가, 할인액 리턴
        }
        return 0;
    }

    function giftMenuDiscount(){
        if(isGiftMenuValid()){
            totalBenefit += "증정 이벤트 : -25,000원";      //증정품 제공 여부 판단해 문자열로 추가
            return 25000;       //증정품 가격 리턴
        }
        return 0;
    }

    function badge(){
        if(!isEventValid())
            return "없음";
        else if(TotalPriceBeforeDiscount-discount>=20000)
            return "산타";
        else if(TotalPriceBeforeDiscount-discount >= 10000)
            return "트리";
        else if(TotalPriceBeforeDiscount-discount >= 5000)
            return "별";
        else
            return "없음";      //총혜택금액에 따라 배지 리턴
    }
  }
}

export default App;
