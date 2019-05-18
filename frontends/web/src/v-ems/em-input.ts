import { on } from "mvdom";


/**
 * This module is about putting the '.focus' class to the eventual <field/> parent. 
 * Note: Escalating the input state to the field parent allows to dramatically simplify the css rules, avoid
 *      making non idiomatic css trick (such as :valid ~ ... tricks),
 *      while keeping the JS logic to a minimum (i.e. O(1) binding, and light and efficient logic)
 */


// on focusin, add the eventual parent .focus class
on(document, 'focusin', 'input', (evt) => {
	const input = evt.selectTarget;
	const parent = input.parentElement;
	if (parent && parent.tagName === 'FIELD') {
		parent.classList.add('focus');
	}
});

// on focusout, remove the eventual parent .focus class
on(document, 'focusout', 'input', (evt) => {
	const input = evt.selectTarget;
	const parent = input.parentElement;
	if (parent && parent.tagName === 'FIELD') {
		parent.classList.remove('focus');
	}
});

// keep the field state in sync with content
on(document, 'change', 'input', (evt) => {
	const input = evt.selectTarget as HTMLInputElement;
	const parent = input.parentElement;
	if (parent && parent.tagName === 'FIELD') {
		if (input.value.length > 0) {
			parent.classList.remove('empty');
		}
		else {
			parent.classList.add('empty');
		}
	}
});
