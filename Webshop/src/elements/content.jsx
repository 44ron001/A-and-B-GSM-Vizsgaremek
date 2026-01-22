function HomePage() {
	return(
    <div className='center'>
		<div className='content'>
			<div className='category_list'>
				<div className='category'>
					<img className='category_image' src='./src/images/gpu.png'/>
					<p className='category_name'>VIDEÓKÁRTYÁK</p>
				</div>
				<div className='category'>
					<img className='category_image' src='./src/images/cpu.png'/>
					<p className='category_name'>PROCESSZOROK</p>
				</div>
				<div className='category'>
					<img className='category_image' src='./src/images/pc.png'/>
					<p className='category_name'>GÉPHÁZAK</p>
				</div>
				<div className='category'>
					<img className='category_image' src='./src/images/monitor.png'/>
					<p className='category_name'>MONITOROK</p>
				</div>
			</div>
		</div>
		<div className="slideshow">
			<div className="slides">
				<img src="./src/slides/slide1.jpg" id="slide1" className="slide" draggable="false"/>
				<div id="slide_text1" className="slide_text s1">Teljeskörű könyvelés, bevallások</div>
				
				<img src="./src/slides/slide2.jpg" id="slide2" className="slide" draggable="false"/>
				<div id="slide_text2" className="slide_text s2">Munka- és személyügy, Bérszámfejtés</div>
				
				<img src="./src/slides/slide3.jpg" id="slide3" className="slide" draggable="false"/>
				<div id="slide_text3" className="slide_text s3">Szabályzatok kidolgozása</div>
				
				<img src="./src/slides/slide4.jpg" id="slide4" className="slide" draggable="false"/>
				<div id="slide_text4" className="slide_text s4">Adótanácsadás</div>
				
				<img src="./src/slides/slide5.jpg" id="slide5" className="slide" draggable="false"/>
				<div id="slide_text5" className="slide_text s5">Cégalapítás és vállalati átvilágítás támogatása</div>
				
				<img src="./src/slides/slide6.jpg" id="slide6" className="slide" draggable="false"/>
				<div id="slide_text6" className="slide_text s6">Solymászat Hungarikum</div>
			</div>
			<div className="nav">
				<div id="prev" className="side"><p>❮</p></div>
				<div id="next" className="side"><p>❯</p></div>
			</div>
			<div className="bullets">
				<div data-index="0" className="active"></div>
				<div data-index="1" className=""></div>
				<div data-index="2" className=""></div>
				<div data-index="3" className=""></div>
				<div data-index="4" className=""></div>
				<div data-index="5" className=""></div>
			</div>
		</div>
	</div>
  );
}
  
export default HomePage;