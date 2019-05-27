// <origin src="https://raw.githubusercontent.com/BriteSnow/cloud-starter/master/services/common/src/top-decorator.ts" />
// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

export function newTopFinder() {
	return new TopFinder();
}

type c = Function;

type TopTargetClassByProperty = Map<string, c>;


class TopFinder {

	// object class, by TopTarget
	private dic: Map<c, TopTargetClassByProperty> = new Map();

	isTop(objectClass: c, targetClass: c, propertyKey: string) {

		let topTargetClassByProperty = this.dic.get(objectClass);

		// if no topTargetChassByProperty, then, this targetCalss is the top one for this objectClass
		// so create the map and return true
		if (!topTargetClassByProperty) {
			topTargetClassByProperty = new Map<string, c>();
			topTargetClassByProperty.set(propertyKey, targetClass);

			this.dic.set(objectClass, topTargetClassByProperty);
			return true;
		}
		// when topTargetClasByProperty
		else {
			let topTargetClass = topTargetClassByProperty.get(propertyKey);

			// if no topTargetClass, then, this targetClass is the top one
			// so we create the entry, and we return true
			if (!topTargetClass) {
				topTargetClassByProperty.set(propertyKey, targetClass);
				return true;
			}
			// otherwise, if we have a topTargetClass, return true if same as objectClass
			else {
				return (topTargetClass === targetClass);
			}
		}
	}
}