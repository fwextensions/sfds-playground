import { scrollObserver } from "./scroll-observer";

const navBar = document.querySelector("#sticky-nav-bar");
const navLinks = navBar.querySelectorAll("a");
const groups = document.querySelectorAll(".listings-group");

const setNavBarHeightVar = (value) => document.documentElement.style.setProperty("--sticky-nav-bar-height", `${value}px`);

setNavBarHeightVar(navBar.getBoundingClientRect().height);
new ResizeObserver(([entry]) => setNavBarHeightVar(entry.contentRect.height)).observe(navBar);

scrollObserver(groups, (id) => {
	const targetLink = navBar.querySelector(`a[href="#${id}"]`);

	navLinks.forEach((link) => link.classList.remove("selected"));
	targetLink.classList.add("selected");

// this seems to cause a hiccup in the user's vertical scrolling when it moves the target link into view.  if we want to
// reveal the newly selected link while the user scrolls, we may need to manually set the scroll position of the navbar.
//	targetLink.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
});
