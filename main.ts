import { Plugin, Notice } from 'obsidian';
import * as DOMPurify from "dompurify";

const SVGoban = require('svgoban');
const SGFParser = require('@sabaki/sgf')
// Remember to rename these classes and interfaces!

interface GobanPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: GobanPluginSettings = {
	mySetting: 'default'
}

export default class GobanPlugin extends Plugin {
	settings: GobanPluginSettings;

	async onload() {
		await this.loadSettings();

		this.registerMarkdownCodeBlockProcessor("sgf", (source, el, ctx) => {
			// convert sgf to markers
			var sgf = SGFParser.parse(source);
			if (sgf[0].children.length == 0) {
				new Notice("Error while parsing SGF")
			}  

			var config = {
				"size":19,
				"theme":"classic",
				"coordSystem":"aa",
				"noMargin":true,
				"hideMargin":true
			};

			var position = {};
			var node = sgf[0]
			while (node.children.length > 0) {
				node = node.children[0]
				if (node.data['B'] !== undefined) {
					// Black player
					position[node.data['B']] = "black"
				} else {
					position[node.data['W']] = "white"
				}
			}

			var markers = {};

			var svgstring = SVGoban.serialize(config, position, markers);
			el.innerHTML = DOMPurify.sanitize(svgstring, {
				USE_PROFILES: { svg: true, html: false, mathMl: false },
			});
		  });
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}