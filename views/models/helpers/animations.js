import { disable_interactions} from "./movement_handlers.js";

function emit_particle_splash(scene, x, y, color) {
    const particles = scene.add.particles('flares');
    const emitter = particles.createEmitter({
        frame: color,
        x: x,
        y: y,
        lifespan: 2000,
        speedY: { min: 100, max: -700 },
        speedX: { min: -300, max: 300 },
        angle: -90,
        gravityY: 900,
        scale: { start: 0.4, end: 0 },
        quantity: 100,
        maxParticles: 300,
        blendMode: 'ADD'
    });
}

function emit_particle_blast(scene, x, y, x1, y1) {
    let particles = scene.add.particles('flares');
    particles.createEmitter({
        frame: 'yellow',
        name: 'suka',
        lifespan: 50,
        angle: 90,
        speed: { min: 2000, max: 2200 },
        x: {start: x, end: x1, steps: 70},
        y: {start: y, end: y1, steps: 70},
        scale: { start: 1, end: 0 },
        quantity: 4,
        blendMode: 'ADD'
    });
    return new Promise(resolve => {
        let emitter = particles.emitters.getByName('suka');
        emitter.onParticleEmit((part) => {
            if(Math.abs(Math.round(part.y) - Math.round(y1)) < 9) {
                emitter.stop();
                resolve();
            }
                
        });
    })
    
}

function fade_out_background(scene, targets) {
    scene.tweens.add({
        targets: targets,
        alpha: 0.3,
        duration: 150
    });
    return {
        fade_back: () => {
            scene.tweens.add({
                targets: targets,
                alpha: 1,
                duration: 150
            });
        }
    };
}

function glow(scene, target) {
    let postFxPlugin = scene.plugins.get('rexglowfilterpipelineplugin');
    let pipeline = postFxPlugin.add(target);
    target.glowTask = scene.tweens.add({
        targets: pipeline,
        intensity: 0.02,
        ease: 'Linear',
        duration: 500,
        repeat: -1,
        yoyo: true
    });
    return {
        stop_glow: () => {
            postFxPlugin.remove(target);
            target.glowTask.stop();
        }
    }
}

function coin_flip(scene, trans_image, scaleSize) {
    scene.coin.transit(trans_image);
    scene.tweens.add({
        targets: scene.coin,
        scaleX: 0.08,
        scaleY: 0.08,
        duration: 100,
        callbackScope: this,
        onComplete: () => {
            scene.tweens.add({
                targets: scene.coin,
                scaleX: scaleSize,
                scaleY: scaleSize,
                duration: 100,
            });
            }
    });
}

function shake(scene, gameObject) {
    gameObject.shake = scene.plugins.get('rexshakepositionplugin')
        .add(gameObject, {
            duration: 500,
            mode: 'effect'
        })
    gameObject.shake.shake();
}

function particle_text(scene, textObject, color) {
    let bitmapZone = scene.plugins.get('rexbitmapzoneplugin').add(textObject);
    let particles = scene.add.particles('flares').setPosition(textObject.x, textObject.y);
    particles.createEmitter({
        frame: color,
        blendMode: 'ADD',
        scale: { start: 0.1, end: 0.2 },
        quantity: 10,
        speed: 8,
        gravityY: -20,
        emitZone: {
            type: 'random',
            source: bitmapZone
        }
    })
}

function shift_to_pointer(scene, target, pointer) {
    return new Promise(resolve => {
        disable_interactions(scene);
        scene.tweens.add({
            targets: target,
            x: pointer.x,
            y: pointer.y,
            duration: 100,
            callbackScope: scene,
            onComplete: () => {
                resolve();
            }
        });
    })
}

function loading(scene) {
    const bars = []

	const radius = 100
	const height = radius * 0.5
	const width = 10

	const cx = scene.game.config.width / 2;
	const cy = scene.game.config.height / 2;

	let angle = -90

	for (let i = 0; i < 12; ++i) {
		const { x, y } = Phaser.Math.RotateAround({ x: cx, y: cy - (radius - (height * 0.5)) }, cx, cy, Phaser.Math.DEG_TO_RAD * angle)
		const bar = scene.add.rectangle(x, y, width, height, 0xffffff, 1)
			.setAngle(angle)
			.setAlpha(0.2)
		bars.push(bar)
		angle += 30
	}
    let index = 0

	const tweens = []

	scene.time.addEvent({
		delay: 70,
		loop: true,
		callback: () => {
			if (index < tweens.length) {
				const tween = tweens[index]
				tween.restart()
			}
			else {
				const bar = bars[index]
				const tween = scene.tweens.add({
					targets: bar,
					alpha: 0.2,
					duration: 400,
					onStart: () => {
						bar.alpha = 1
					}
				})
				tweens.push(tween)
			}
			++index

			if (index >= bars.length)
				index = 0
		}
	})
    return {stop_loading: () => {
        for(let tween of tweens)
            tween.stop();
        for(let bar of bars)
            bar.destroy();
    }}
}

export {
    emit_particle_splash,
    emit_particle_blast,
    particle_text,
    fade_out_background,
    shift_to_pointer,
    coin_flip,
    shake,
    glow,
    loading
};