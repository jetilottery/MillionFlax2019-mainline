define(function(require) {
	const gameFlow = require("skbJet/componentManchester/standardIW/gameFlow");
	const audio = require("skbJet/componentManchester/standardIW/audio");
	const SKBeInstant = require("skbJet/component/SKBeInstant/SKBeInstant");
	const msgBus = require("skbJet/component/gameMsgBus/GameMsgBus");
	const mainGame = require("game/components/mainGame");
	const bonusGame = require("game/components/bonusGame");
	const displayList = require("skbJet/componentManchester/standardIW/displayList");

	require("com/gsap/TimelineLite");
	const Timeline = window.TimelineLite;

	let gameFinished = false;
	let resetCalled = false;

	function gameReset() {
		resetCalled = true;
		clearGames();

		// Fade out the win/lose terminator in case it is still playing
		if (audio.isPlaying("winTerminator")) {
			audio.fadeOut("winTerminator", 1);
		}
		if (audio.isPlaying("loseTerminator")) {
			audio.fadeOut("loseTerminator", 1);
		}

		msgBus.publish("UI.updateButtons", {
			audioOn: {visible: true, enabled: true},
			audioOff: {visible: true, enabled: true},
			info: {visible: true, enabled: true},
			back: {visible: false, enabled: false},
			buy: false,
			try: false,
			playAgain: {visible: false}
		});

		gameFlow.next("BUY_SCREEN");
	}

	//Simple latch to force waiting till the games have faded before clearing them
	function clearGames() {
		if(resetCalled && gameFinished) {
			mainGame.reset();
			bonusGame.reset();
			gameFinished = false;
			resetCalled = false;

			msgBus.publish("UI.updateButtons", {
				buy: {visible: SKBeInstant.config.wagerType === "BUY", enabled: SKBeInstant.config.wagerType === "BUY"},
				try: {visible: SKBeInstant.config.wagerType === "TRY", enabled: SKBeInstant.config.wagerType === "TRY"}
			});
		}
	}

	msgBus.subscribe("Game.Finish", () => {
		mainGame.setActive(false);
		bonusGame.setActive(false);
		msgBus.publish("UI.updateButtons", {
			audioOn: false,
			audioOff: false,
			info: false,
			scratchAll: false,
			buy: false,
			try: false,
			left: false,
			right: false,
			back: false,
			scratchAllConfirm: false,
			scratchAllCancel: false,
			playAgain: false
		});
		new Timeline({
			onComplete: () => {
				gameFinished = true;
				clearGames();
			}
		})
			.to(displayList.mainGame, 1, {alpha: 0, visible: false}, 0)
			.to(displayList.bonusGame, 1, {alpha: 0, visible: false}, 0)
			.to(displayList.purchase, 1, {alpha: 1, visible: true});
	});

	gameFlow.handle(gameReset, "GAME_RESET");
});
