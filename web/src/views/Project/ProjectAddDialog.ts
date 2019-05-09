import { addDomEvents } from 'views/base';
import { DialogBase } from 'views/Dialog/DialogBase';
import { render } from 'ts/render';
import { first, all, append, frag } from 'mvdom';
import { getRepos, importRepo } from 'ts/gh-api';


export class ProjectAddDialog extends DialogBase {

	//// View key dom elements
	get contentEl() { return first(this.el, '.content')! };
	get reposUl() { return first(this.el, 'section.github ul')! };

	//// View states
	get mode() {
		return this.contentEl.classList.contains('custom') ? 'custom' : 'github';
	}

	set mode(m: string) {
		all(this.el, '.content .tab-bar a').forEach((item) => item.classList.remove('sel'));
		first(this.el, `.content .tab-bar .tab-${m}`)!.classList.add('sel');
		this.el.classList.remove('custom', 'github');
		this.el.classList.add(m);

		if (m === 'github') {
			this.refreshRepos();
		}
	}

	//#region    ---------- View DOM Events ---------- 

	//#endregion ---------- /View DOM Events ---------- 
	events = addDomEvents(this.events, {

		// click on tab
		'click; .content .tab-bar a': (evt) => {
			const selectEl = evt.selectTarget;
			const m = selectEl.classList.contains('tab-custom') ? 'custom' : 'github';
			this.mode = m;
		},

		// click on github project
		'click; section.github ul a': async (evt) => {
			const selectEl = evt.selectTarget;
			const repoFullName = selectEl.getAttribute('data-gh-repo')!;
			const repo = await importRepo(repoFullName);
			this.doClose();
		}
	});

	//#region    ---------- View Controller Methods ---------- 
	init(data: any) {
		this.title = "Add new Project";
		this.content = render('ProjectAddDialog-content', data);
		this.footer = true;
		this.mode = 'custom';
	}
	//#endregion ---------- /View Controller Methods ---------- 

	//#region    ---------- View Methods ---------- 

	async refreshRepos() {
		let repos = await getRepos();
		let html = '';
		const max = 5;
		let c = 0;
		// sort by updated_at
		// repos = repos.sort((a, b) => {
		// 	return (a.pushed_at === b.pushed_at) ? 0 : (a.pushed_at > b.pushed_at) ? -1 : 1;
		// });
		for (const repo of repos) {

			html += `<a data-gh-repo="${repo.full_name}">${repo.full_name}</a>`;
		}
		append(this.reposUl, frag(html), 'empty');
	}

	//#endregion ---------- /View Methods ---------- 

}