let lastScrollY = 0;
let scrollDirection = 1;

addEventListener("scroll", () => {
	scrollDirection = scrollY > lastScrollY ? 1 : -1;
	lastScrollY = scrollY;
});

export function scrollObserver(
	elements,
	handler,
	options = { ratio: .6 })
{
	const resizeObserver = new ResizeObserver(handleResize);
	let currentElement = null;
	let elementHeights = {};
	let observers = [];

	function handleResize(
		entries)
	{
		for (const entry of entries) {
			const currentHeight = elementHeights[entry.target.id];
			const diff = Math.abs(entry.contentRect.height - currentHeight) / currentHeight;

			if (diff > .02) {
					// the resized difference is big enough that we should reset the intersection ratios
				initObservers();

				return;
			}
		}
	}

	function handleIntersection(
		[entry])
	{
		const { target, intersectionRatio } = entry;
		const id = target.id;

		if (!currentElement ||
			(
				id !== currentElement.id
				&& intersectionRatio
					// check that the new element is in the same direction the user is scrolling from the current one
				&& (target.offsetTop - currentElement.offsetTop) * scrollDirection > 0
			)
		) {
			currentElement = target;
			handler(id, currentElement);
		}
	}

	function initObservers()
	{
		observers.forEach((observer) => observer.disconnect());
		observers = [];
		resizeObserver.disconnect();

		for (const element of elements) {
				// create a different threshold and observer for each element, in case they have very different heights
			const threshold = Math.min(1, window.innerHeight / element.clientHeight * options.ratio);
			const observer = new IntersectionObserver(handleIntersection, { threshold });

			observer.observe(element);
			observers.push(observer);
			elementHeights[element.id] = element.clientHeight;
			resizeObserver.observe(element);
		}
	}

	initObservers();
}
