import React from "react";
import PhotoAlbum from "react-photo-album";
import ScrollableSection from "/src/layouts/scrollableSection/ScrollableSection";

const photos = [
	{ src: "/src/assets/images/furnace-top.webp", width: 800, height: 600 },
	{ src: "/src/assets/images/furnace-top.webp", width: 800, height: 600 },
	{ src: "/src/assets/images/furnace-top.webp", width: 800, height: 600 },
	{ src: "/src/assets/images/furnace-top.webp", width: 800, height: 600 },
	{ src: "/src/assets/images/furnace-top.webp", width: 800, height: 600 },
	{ src: "/src/assets/images/furnace-top.webp", width: 800, height: 600 },
	{ src: "/src/assets/images/furnace-top.webp", width: 800, height: 600 },
	{ src: "/src/assets/images/furnace-top.webp", width: 800, height: 600 },
	{ src: "/src/assets/images/furnace-top.webp", width: 800, height: 600 },
	{ src: "/src/assets/images/furnace-top.webp", width: 800, height: 600 },
];

const GallerySection = () => {
	return (
		<ScrollableSection id="gallery-section" title="Gallery">
			<PhotoAlbum layout="rows" photos={photos} />
		</ScrollableSection>
	);
};

export default GallerySection;