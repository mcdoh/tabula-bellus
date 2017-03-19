import {forEach} from './tools.js';

const READ_ONLY = 'readonly';
const READ_WRITE = 'readwrite';
// const VERSION_CHANGE = 'versionchange';

const DEFAULT_SETTINGS = {
	ready: () => {},
	error: error => console.error(`Database error: ${ error.target.errorCode }`)
};

export default class LocalDB {
	constructor (settings = {}) {
		if (!settings.db || !settings.version) throw `Missing DB parameters! db: ${ settings.db }, version: ${ settings.version }`;

		[
			'onError',
			'onSuccess',
			'onUpgradeNeeded',
			'getObjectStore',
			'getData'
		].map(method => this[method] = this[method].bind(this));

		this.settings = Object.assign({}, DEFAULT_SETTINGS, settings);

		let request = indexedDB.open(this.settings.db, this.settings.version);

		request.onerror = this.onError;
		request.onsuccess = this.onSuccess;
		request.onupgradeneeded = this.onUpgradeNeeded;
	}

	onError (error) {
		this.settings.error(error);
	}

	onSuccess (event) {
		console.debug(`Loaded ${ this.settings.db }`);

		this.db = event.target.result;
		console.debug('DB', this.db);
		this.settings.ready();
	}

	onUpgradeNeeded (event) {
		console.debug('Upgrading...');

		this.db = event.target.result;
		let tx = event.target.transaction;

		forEach(this.settings.stores, store => {
			if (tx.objectStoreNames.contains(store.name)) {
				console.debug(' upgrading:', store.name);
			}
			else {
				console.debug(' creating:', store.name);
			}

			let objectStore = tx.objectStoreNames.contains(store.name) ? tx.objectStore(store.name) :
				this.db.createObjectStore(store.name, store.key);

			forEach(store.indexes, index => objectStore.createIndex(index));

			this.getData(objectStore, data => {
				console.debug(' got data', data);

				if (store.upgrade) {
					console.debug(' data upgrade...');
					this.storeData(objectStore, store.upgrade(data));
				}
			});
		});
	}

	getObjectStore (storeName, mode = READ_ONLY) {
		let tx = this.db.transaction(storeName, mode);
		return tx.objectStore(storeName);
	}

	getData (store, callback) {
		if (this.db) {
			let data = {};
			store = typeof store === 'string' ? this.getObjectStore(store, READ_ONLY) : store;

			let cursorReq = store.openCursor();

			cursorReq.onsuccess = event => {
				let cursor = event.target.result;

				if (cursor) {

// 					let dataReq = store.get(cursor.key);
//
// 					dataReq.onsuccess = event => {
// 						console.debug(cursor.key);
// 						data.push(event.target.result);
// 					};

					data[cursor.key] = cursor.value;
					cursor.continue();
				}
				else {
					callback(data);
				}
			};

			cursorReq.onerror = event => {
				console.error('storeName', event);
			};
		}
	}

	storeData (store, data) {
		if (this.db) {
			store = typeof store === 'string' ? this.getObjectStore(store, READ_WRITE) : store;

			forEach(data, (value, key) => {
				console.debug(`putting ${ key }: ${ value }`);
				let putReq = store.put(value, key);

				putReq.onsuccess = event => {
					console.debug(`GREAT SUCCESS! ${ key }: ${ value }`);
				};

				putReq.onerror = event => {
					console.error(`storeData ${ key }: ${ value }`, event.target.error);
				};
			});
		}
	}

// 	getData (objectStoreName) {
// 		let transaction = this.db.transaction([objectStoreName], READ_WRITE);
// 		let objectStore = transaction.objectStore(objectStoreName);
//
// 		// Get everything in the objectStore;
// 		let keyRange = IDBKeyRange.lowerBound(0);
// 		let cursorRequest = objectStore.openCursor(keyRange);
//
// 		cursorRequest.onsuccess = event => {
// 			let result = event.target.result;
// 			console.debug('something happened!', result);
//
// 			if (!result) return null;
//
// 			console.debug(result.value);
//
// 			result.continue();
// 		};
//
// 		cursorRequest.onerror = this.onError;
// 	}
}
