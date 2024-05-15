import React from 'react';
import { LineHeader, InfoBlock } from '/src/components/ui';
import useResponsive from '/src/hooks/useResponsive';
import styles from './PostContent.module.css';

const PostContent = () => {
	const { isMobile } = useResponsive();

	return (
		<div className={`${styles.postContent} ${isMobile ? styles.mobilePostContent : ''}`}>
			<LineHeader title="Introducing Our New Website" />
			<InfoBlock margin="40px 0 0">
				<p>
					We are thrilled to present our brand new website for Cornwall Iron Furnace!
					This redesign marks a significant milestone in our efforts to enhance the
					online experience for our visitors and supporters.
				</p>
			</InfoBlock>
			<InfoBlock margin="20px 0 0">
				<p>
					In the coming weeks, we will be introducing exciting new features to the website.
					Soon, you'll be able to easily purchase merchandise through our
					convenient e-commerce functionality. We are also working on implementing a
					seamless online donation system, allowing you to support our mission with just a
					few clicks. Additionally, we are developing a dedicated membership portal, where
					our valued members can access exclusive content and personalized experiences.
				</p>
			</InfoBlock>
			<InfoBlock margin="20px 0 80px">
				<p>
					As we continue to improve and expand our website, we invite you to explore and
					provide feedback. Your input is invaluable to us as we strive to create an online
					platform that meets your needs and exceeds your expectations. If you have any
					suggestions, comments, or ideas regarding the website's functionality, appearance,
					or content, please don't hesitate to reach out to us at {' '}
					<a href="mailto:feedback@cornwallironfurnace.org">feedback@cornwallironfurnace.org</a>.
					We appreciate your support and look forward to hearing from you!
				</p>
			</InfoBlock>

			<LineHeader title="Website Overview" />
			<div className={`${styles.features} ${isMobile ? styles.mobileFeatures : ''}`}>
				<InfoBlock margin="40px 0 0">
					<h3>Visitor Information</h3>
					<p>Explore the rich history of Cornwall Iron Furnace.</p>
				</InfoBlock>
				<InfoBlock margin="40px 0 0">
					<h3>Educational Resources</h3>
					<p>Access a wealth of educational materials, including articles, photos, and videos.</p>
				</InfoBlock>
				<InfoBlock margin="40px 0 80px">
					<h3>Event Calendar</h3>
					<p>Stay up-to-date with our upcoming events and plan your visit accordingly.</p>
				</InfoBlock>
			</div>

			<LineHeader title="Future Updates" />
			<InfoBlock margin="40px 0 0">
				<ul>
					<li>Interactive timeline of Cornwall Iron Furnace's history</li>
					<li>Online merchandise shop</li>
					<li>Membership accounts for easy online renewal</li>
					<li>Donation portal for secure online giving</li>
				</ul>
			</InfoBlock>
		</div>
	);
};

export default PostContent;