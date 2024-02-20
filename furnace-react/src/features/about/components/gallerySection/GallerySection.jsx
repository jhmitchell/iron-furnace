import React from "react";
import PhotoAlbum from "react-photo-album";
import ScrollableSection from "/src/layouts/scrollableSection/ScrollableSection";

import FurnaceImg from "/src/assets/images/furnace-top.webp";

const photos = [
	{ src: FurnaceImg, width: 800, height: 600 },
	{ src: FurnaceImg, width: 800, height: 600 },
	{ src: FurnaceImg, width: 800, height: 600 },
	{ src: FurnaceImg, width: 800, height: 600 },
	{ src: FurnaceImg, width: 800, height: 600 },
	{ src: FurnaceImg, width: 800, height: 600 },
	{ src: FurnaceImg, width: 800, height: 600 },
	{ src: FurnaceImg, width: 800, height: 600 },
	{ src: FurnaceImg, width: 800, height: 600 },
	{ src: FurnaceImg, width: 800, height: 600 },
	{ src: FurnaceImg, width: 800, height: 600 },
	{ src: FurnaceImg, width: 800, height: 600 },
	{ src: FurnaceImg, width: 800, height: 600 },
	{ src: FurnaceImg, width: 800, height: 600 },
];

const GallerySection = () => {
	return (
		<ScrollableSection id="gallery-section" title="Gallery">
			<PhotoAlbum layout="rows" photos={photos} />
		</ScrollableSection>
	);
};

export default GallerySection;