//const Phaser = require("phaser");

var config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 300},
			debug: false
		}	
	},
	scene: {
		preload: preload,
		create: create,
		update: update
	}
};

var score = 0;
var scoreText;
var gameOver = false;

var game = new Phaser.Game(config);

function preload() {
	this.load.image('santuario', 'assets/santuario.png');
	this.load.image('ground', 'assets/platform.png');
	this.load.image('pescado', 'assets/pescado.png');
	this.load.image('bomb', 'assets/bomb.png');
	this.load.spritesheet('gatitos', 'assets/gatitos.png', {frameWidth: 32, frameHeight: 44});
}

function create() {
	this.add.image(400, 300,'santuario');
	
	platforms = this.physics.add.staticGroup();

	platforms.create(400, 568, 'ground').setScale(2).refreshBody();

	platforms.create(600, 400, 'ground');
	platforms.create(50, 250, 'ground');
	platforms.create(750, 220, 'ground');

	player = this.physics.add.sprite(100, 450, 'gatitos');

	player.setCollideWorldBounds(true);
	player.setBounce(0.2);

	this.anims.create({
		key: 'left',
		frames: this.anims.generateFrameNumbers('gatitos', { start: 0, end: 5}),
		frameRate: 10,
		repeat: -1
	});

	this.anims.create({
		key: 'turn',
		frames: [ { key: 'gatitos', frame: 6 }],
		frameRate: 20		
	});

	this.anims.create({
		key: 'right',
		frames: this.anims.generateFrameNumbers('gatitos', { start: 7, end: 12}),
		frameRate: 10,
		repeat: -1
	});

	//player.body.setGravityY(300);

	this.physics.add.collider(player, platforms);

	cursors = this.input.keyboard.createCursorKeys();

	pescados = this.physics.add.group({
		key: 'pescado',
		repeat: 11,
		setXY: {x: 12, y:0, stepX: 70}
	});

	pescados.children.iterate(function (child) {

    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

});

	this.physics.add.collider(pescados,platforms);
	this.physics.add.overlap(player, pescados, collectStar, null, this);

	scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000'});

	bombs = this.physics.add.group();

	this.physics.add.collider(bombs, platforms);

	this.physics.add.collider(player, bombs, hitBomb, null, this);


}

function update() {

	if (gameOver) {
		return
	}

	if (cursors.left.isDown) {
		player.setVelocityX(-160);
		player.anims.play('left', true);
	} else if (cursors.right.isDown) {
		player.setVelocityX(160);
		player.anims.play('right', true);
	} else {
		player.setVelocityX(0);
		player.anims.play('turn');
	}

	if (cursors.up.isDown && player.body.touching.down) {
		player.setVelocityY(-330);
	}

}

function collectStar(player, pescado) {
	pescado.disableBody(true, true);

	score += 10;
	scoreText.setText('Score: '+ score);

	if (pescados.countActive(true) === 0) {
		pescados.children.iterate(function(child) {
			child.enableBody(true, child.x, 0, true, true);
		});
	

	var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

	var bomb = bombs.create(x, 16, 'bomb');
	bomb.setBounce(1);
	bomb.setCollideWorldBounds(true);
	bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
	}
}

function hitBomb(player, bomb) {

	this.physics.pause();

	player.setTint(0xff0000);

	player.anims.play('turn');
	gameOver = true;

}
// controles flotantes

document.addEventListener('DOMContentLoaded', () => {
    const upBtn = document.getElementById('up');
    const downBtn = document.getElementById('down');
    const leftBtn = document.getElementById('left');
    const rightBtn = document.getElementById('right');

    // Agrega los eventos de toque para cada botón
    upBtn.addEventListener('touchstart', () => moveUp());
    downBtn.addEventListener('touchstart', () => moveDown());
    leftBtn.addEventListener('touchstart', () => moveLeft());
    rightBtn.addEventListener('touchstart', () => moveRight());

    // Funciones para controlar el personaje
    function moveUp() {
        if (player.body.touching.down) {
            player.setVelocityY(-330);
        }
    }

    function moveDown() {
        // Puedes agregar funcionalidad si deseas un botón de agacharse o moverse hacia abajo.
    }

    function moveLeft() {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    }

    function moveRight() {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
});

// Asegúrate de que el jugador se detenga cuando se suelta el botón
document.getElementById('left').addEventListener('touchend', () => {
    player.setVelocityX(0);
    player.anims.play('turn');
});
document.getElementById('right').addEventListener('touchend', () => {
    player.setVelocityX(0);
    player.anims.play('turn');
});





//paginas responsivas






window.addEventListener('resize', resize);

function resize() {
    let canvas = game.canvas, width = window.innerWidth, height = window.innerHeight;
    let wratio = width / height, ratio = canvas.width / canvas.height;

    if (wratio < ratio) {
        canvas.style.width = width + 'px';
        canvas.style.height = (width / ratio) + 'px';
    } else {
        canvas.style.width = (height * ratio) + 'px';
        canvas.style.height = height + 'px';
    }
}

document.getElementById('restartBtn').addEventListener('click', () => {
    // Reinicia el juego
    gameOver = false;
    score = 0;
    scoreText.setText('Score: ' + score);

    // Reactiva el jugador y elimina el tinte rojo
    player.clearTint();
    player.setPosition(100, 450);
    player.setVelocity(0, 0);
    player.anims.play('turn');

    // Reactiva las bombas y los pescados
    pescados.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
    });

    bombs.clear(true, true);

    // Reactiva la física del jugador
    game.scene.scenes[0].physics.resume();
});

document.getElementById('salir').addEventListener('click', () => {
            window.location.href = '../index.html'; // Reemplaza con la URL de destino
        });


