import React from "react";
import PhotoAlbum from "react-photo-album";
import ScrollableSection from "/src/layouts/scrollableSection/ScrollableSection";

import FurnaceImg from "/src/assets/images/furnace-top.webp";
import AbattoirWindow from "/src/assets/images/abattoir-window-min.jpg";
import RoundWindow from "/src/assets/images/round-window-min.jpg";
import BlacksmithShop from "/src/assets/images/blacksmith-shop-min.jpg";
import BigWheel from "/src/assets/images/big-wheel-min.jpg";
import Bell from "/src/assets/images/bell-min.jpg";
import GothicWindow from "/src/assets/images/gothic-window-min.jpg";
import Cannon from "/src/assets/images/cannon-min.jpg";

const photos = [
	{ src: FurnaceImg, width: 7728, height: 5152 },
	{ src: AbattoirWindow, width: 370, height: 350 },
	{ src: BlacksmithShop, width: 640, height: 427 },
	{ src: RoundWindow, width: 1283, height: 1166 },
	{ src: BigWheel, width: 800, height: 600 },
	{ src: Bell, width: 640, height: 427 },
	{ src: GothicWindow, width: 241, height: 427 },
	{ src: Cannon, width: 640, height: 268 },
];

const GallerySection = () => {
	return (
		<ScrollableSection id="gallery-section" title="Gallery">
			<PhotoAlbum layout="rows" photos={photos} />
		</ScrollableSection>
	);
};

export default GallerySection;