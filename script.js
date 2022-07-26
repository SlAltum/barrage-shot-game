let background = document.getElementById('background')
let player = document.getElementById('player')
player.die = false
let score = 0
let scoreBar = document.getElementById('score')
// 碰撞检测
function crashDitection(src,dest){
    return !(
        src.offsetLeft > dest.offsetLeft+dest.offsetWidth ||
        src.offsetLeft+src.offsetWidth < dest.offsetLeft ||
        src.offsetTop > dest.offsetTop+dest.offsetHeight ||
        src.offsetTop+src.offsetHeight < dest.offsetTop
    )
}
// 追踪弹
// src:子弹, dest:目标, vel:子弹速度(每次刷新时移动的距离)
function traceOnMove(src,dest,vel){
    const distX = dest.offsetLeft-src.offsetLeft
    const distY = dest.offsetTop-src.offsetTop
    const shiftX = Math.ceil(vel*distX/Math.sqrt(distX*distX+distY*distY))
    const shiftY = Math.ceil(vel*distY/Math.sqrt(distX*distX+distY*distY))
    src.style.left = src.offsetLeft+shiftX+'px'
    src.style.top = src.offsetTop+shiftY+'px'
}
// 是否触碰边缘
function onBorder(src){
    return (
        !(src.offsetLeft >= 0 &&
        src.offsetLeft+src.offsetWidth <= background.offsetWidth &&
        src.offsetTop >= 0 &&
        src.offsetTop+src.offsetHeight <= background.offsetHeight)
    )
}
// 用节流定时器限制最小射击间隔
let shotTimer = null
document.onkeydown = (e)=>{
    e = e || window.event
    let code = e.keyCode
    // console.log(code)
    // 玩家一步移动多少像素
    const step = 10
    switch(code){
        case 37:
            if(player.offsetLeft-step > 0){
                player.style.left = player.offsetLeft-step+'px'
            }break;
        case 39:
            if(player.offsetLeft+player.offsetWidth+step < background.offsetWidth){
                player.style.left = player.offsetLeft+step+'px'
            }break;
        case 38:
            if(player.offsetTop-step >0){
                player.style.top = player.offsetTop-step+'px'
            }break;
        case 40:
            if(player.offsetTop+player.offsetHeight+step > background.offsetHeight){
                player.style.top = player.offsetTop+step+'px'
            }break;
        case 32:
            // playerShot()
            // console.log(shotTimer)
            if(!shotTimer){
                shotTimer = setTimeout(() => {
                    playerShot()
                    shotTimer = null
                }, 200);
            }
        default:
    }
}
function playerShot(){
    let playerBullet = document.createElement('div')
    playerBullet.className = 'bullet'
    playerBullet.style.left = player.offsetLeft+player.offsetWidth/2-1+'px'
    playerBullet.style.top = player.offsetTop+'px'
    // console.log(playerBullet.style.left)
    background.appendChild(playerBullet)
    let bulletFly = setInterval(() => {
        if(onBorder(playerBullet)){
            playerBullet.remove()
            clearInterval(bulletFly)
        }
        let enemies = document.querySelectorAll('.enemy')
        try {
            enemies.forEach((item) => {
                if(crashDitection(playerBullet,item)){
                    playerBullet.remove()
                    item.die = true
                    // item.remove()
                    // 计算分数
                    score += item.score
                    scoreBar.innerHTML = `SCORE:${score}`
                    clearInterval(bulletFly)
                    throw new Error('break');
                }
            });
        }catch(e){}finally{}
        // 让子弹飞
        playerBullet.style.top = playerBullet.offsetTop-4+'px'
    }, 17);
}
// 游戏开始
const tooltip = document.getElementById('tooltip')
function gameStart(){
    const startBtn = document.getElementById('start-game')
    startBtn.disabled = true
    tooltip.style.display = 'none'
    // 士兵来袭
    setInterval(() => {
        let soldier = document.createElement('div')
        background.appendChild(soldier)
        soldier.className = 'soldier enemy'
        soldier.style.top = 0+'px'
        soldier.style.left = Math.ceil((background.offsetWidth-soldier.style.width)*Math.random())+'px'
        soldier.die = false
        soldier.score = 1
        // 士兵移动
        let soldierMove = setInterval(() => {
            // console.log(soldier.die)
            if(soldier.die){
                soldier.remove()
                clearInterval(soldierMove)
                clearInterval(soldierShot)
            }
            if(onBorder(soldier)){
                soldier.remove()
                clearInterval(soldierMove)
                clearInterval(soldierShot)
            }
            if(crashDitection(soldier,player)){
                if(!player.die)gameOver();
            }
            soldier.style.top = soldier.offsetTop+1+'px'
        }, 17);
        // 士兵射击
        let soldierShot = setInterval(() => {
            let soldierBullet = document.createElement('div')
            background.appendChild(soldierBullet)
            soldierBullet.className = 'bullet'
            soldierBullet.style.left = soldier.offsetLeft+soldier.offsetWidth/2-1+'px'
            soldierBullet.style.top = soldier.offsetTop+'px'
            const vel = 4
            const distX = player.offsetLeft-soldier.offsetLeft
            const distY = player.offsetTop-soldier.offsetTop
            const shiftX = Math.ceil(vel*distX/Math.sqrt(distX*distX+distY*distY))
            const shiftY = Math.ceil(vel*distY/Math.sqrt(distX*distX+distY*distY))
            let bulletFly = setInterval(() => {
                if(onBorder(soldierBullet)){
                    soldierBullet.remove()
                    clearInterval(bulletFly)
                }
                if(crashDitection(soldierBullet,player)){
                    if(!player.die)gameOver();
                    soldierBullet.remove()
                    clearInterval(bulletFly)
                }
                // 让子弹飞
                soldierBullet.style.top = soldierBullet.offsetTop+shiftY+'px'
                soldierBullet.style.left = soldierBullet.offsetLeft+shiftX+'px'
            }, 17);
        }, 1000);
    }, 1000);
}
// 游戏结束
function gameOver(){
    player.remove()
    tooltip.style.display = 'flex'
    tooltip.innerHTML = `
    <h3>游戏结束<h3>
    <h3>您的得分为:${score}<h3>`
}