$(function(){
    let wheelDelta=0; //휠 이벤트 발생시 반환값 확인 변수
    let browser=0;//파이어폭스 브라우저 판별 변수

    //browser[event-mousewheel] : 크롬, 익스, 사파리, 오페라...
    //browser[event-DOMMouseScroll] : 파이어폭스
    //파이어폭스 브라우저 판별 =>window.navigator.userAgent
    $('.section').each(function(index){
        $(this).on('mousewheel DOMMouseScroll', function(event){
            event.preventDefault();
            browser=window.navigator.userAgent.toLowerCase().indexOf('firefox');
            if(browser>=0){
                wheelDelta=-event.detail*40;
            }else{
                wheelDelta=event.originalEvent.wheelDelta;
            }
            //console.log(wheelDelta);

            if(wheelDelta<0){//-120 or -150 값을 가지면 다음 섹션으로 이동
                if(index < $('.section').length -1){
                    $('html, body').stop().animate({scrollTop:$(this).next().offset().top},500);
                }
            }else{ //위로 섹션으로 이동
                if(index>0){
                    $('html, body').stop().animate({scrollTop:$(this).prev().offset().top},500);
                }
            }
        });
    });

});

let canvas;
let ctx;
let flowField;
let flowFieldAnimation;

window.onload = function(){
    canvas = document.getElementById('canvas1');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    flowField = new FlowFiedEffect(ctx, canvas.width, canvas.height);
    flowField.animate(0);
}

window.addEventListener('resize', function(){
    this.cancelAnimationFrame(flowFieldAnimation);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    flowField = new FlowFiedEffect(ctx, canvas.width, canvas.height);
    flowField.animate(0);
});

const mouse = {
    x: 0,
    y: 0,
}
window.addEventListener('mousemove', function(e){
    mouse.x = e.x;
    mouse.y = e.y;
});
class FlowFiedEffect {
    #ctx;
    #width;
    #height;
    constructor(ctx, width, height){
        this.#ctx = ctx;
        this.#ctx.lineWidth = 0.2; //
        this.#width = width;
        this.#height = height;
        this.lastTime = 0;
        this.interval = 1000/60;
        this.timer = 0;
        this.cellSize = 13; //
        this.gradient;
        this.#createGradient();
        this.#ctx.strokeStyle = this.gradient;
        this.radius = 0;
        this.vr = 0.03;
    }
    #createGradient(){
        this.gradient = this.#ctx.createLinearGradient(0, 0, this.#width, this.#height);
        this.gradient.addColorStop("0.1", "#ff5c33");
        this.gradient.addColorStop("0.2", "#ff66b3");
        this.gradient.addColorStop("0.4", "#ccccff");
        this.gradient.addColorStop("0.6", "#b3ffff");
        this.gradient.addColorStop("0.8", "#80ff80");
        this.gradient.addColorStop("0.9", "#ffff33");
    }
    #drawLine(angle, x, y){
        let positionX = x;
        let positionY = y;
        let dx = mouse.x - positionX;
        let dy = mouse.y - positionY;
        let distance = dx * dx + dy * dy;
        if (distance > 900000) distance = 800000;
        else if (distance < 70000) distance = 70000;
        const length = distance/10000;
        this.#ctx.beginPath();
        this.#ctx.moveTo(x, y);
        this.#ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);    //20~30 두깨감
        this.#ctx.stroke();
    }
    animate(timeStamp){
        const deltaTime = timeStamp - this.lastTime;
        this.lastTime = timeStamp;
        if (this.timer > this.interval){
            this.#ctx.clearRect(0, 0, this.#width, this.#height);
            this.radius += this.vr;
            if (this.radius > 7 || this.radius < -7) this.vr *= -1;

            for (let y = 0; y < this.#height; y += this.cellSize){
                for (let x = 0; x < this.#width; x += this.cellSize){
                    const angle = (Math.cos(mouse.x * x * 0.00001) + Math.sin(mouse.y * y * 0.00001)) * this.radius;  //수치 바꾸기 0.5   0,5
                    this.#drawLine(angle, x, y);
                }
            }

            this.timer = 0;
        } else {
            this.timer += deltaTime;
        }
        flowFieldAnimation = requestAnimationFrame(this.animate.bind(this));
    }
}