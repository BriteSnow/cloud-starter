
// find the "spriteName" from the URL
var fileName = window.location.pathname.split("/").slice(-1)[0];
var spriteName = fileName.replace("-demo.html", "");

// add the 
document.addEventListener("DOMContentLoaded", async function (event) {
	const url = spriteName + ".svg";
	const svgContent = await (await fetch(url)).text();
	const xml = (new DOMParser()).parseFromString(svgContent, "application/xml");

	const symbols = Array.from(xml.querySelectorAll("symbol")).map(sym => ({ name: sym.getAttribute("id") }));
	// do after the symbols above as the firstElementChild will be moved
	document.querySelector("head").appendChild(xml.firstElementChild);

	document.querySelector("#icons-ctn").innerHTML = renderSymbols(symbols);

});

function renderSymbols(symbols) {
	let htmlContent = '';
	for (const { name } of symbols) {
		htmlContent += `
					<div class="icon-card">
						<div class="icon">
							<svg class="svg-ico">
								<use xlink:href="#${name}"></use>
							</svg>
						</div>
						<label>${name}</label>
					</div>				
					`
	}
	return htmlContent;
}