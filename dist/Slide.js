import Timeout from './Timeout.js';
export default class Slide {
    container;
    slides;
    controls;
    time;
    index;
    slide;
    timeout;
    pausedTimeout;
    paused;
    thumbItems;
    thumb;
    constructor(container, slides, controls, time = 5000) {
        this.container = container;
        this.slides = slides;
        this.controls = controls;
        this.time = time;
        this.index = localStorage.getItem('activeSlide')
            ? Number(localStorage.getItem('activeSlide'))
            : 0;
        this.slide = this.slides[this.index];
        this.paused = false;
        this.timeout = null;
        this.pausedTimeout = null;
        this.thumbItems = null;
        this.thumb = null;
        this.init();
    }
    hide(el) {
        el.classList.remove('active');
        if (el instanceof HTMLVideoElement) {
            el.currentTime = 0;
            el.pause();
        }
    }
    show(index) {
        this.index = index;
        this.slide = this.slides[this.index];
        localStorage.setItem('activeSlide', String(this.index));
        if (this.thumbItems) {
            this.thumb = this.thumbItems[this.index];
            this.thumbItems.forEach((el) => el.classList.remove('active'));
            this.thumb.classList.add('active');
        }
        this.slides.forEach((slide) => this.hide(slide));
        this.slide.classList.add('active');
        if (this.slide instanceof HTMLVideoElement) {
            this.addSoundButton(this.slide);
            this.autovideo(this.slide);
        }
        else {
            this.auto(this.time);
            document.querySelector('.sound-button')?.remove();
        }
    }
    autovideo(video) {
        video.muted = true;
        video.play();
        let firstPlay = true;
        video.addEventListener('playing', () => {
            if (firstPlay) {
                this.auto(video.duration * 1000);
                firstPlay = false;
            }
        });
    }
    auto(time) {
        this.timeout?.clear();
        this.timeout = new Timeout(() => this.next(), time);
        if (this.thumb)
            this.thumb.style.animationDuration = `${time}ms`;
    }
    prev() {
        if (this.paused)
            return;
        const prev = this.index > 0 ? this.index - 1 : this.slides.length - 1;
        this.show(prev);
    }
    next() {
        if (this.paused)
            return;
        const next = this.index + 1 < this.slides.length ? this.index + 1 : 0;
        this.show(next);
    }
    pause() {
        document.body.classList.add('paused');
        this.pausedTimeout = new Timeout(() => {
            this.visibleItems(false);
            this.timeout?.pause();
            this.paused = true;
            this.thumb?.classList.add('paused');
            if (this.slide instanceof HTMLVideoElement) {
                this.slide.pause();
            }
        }, 300);
    }
    continue() {
        document.body.classList.remove('paused');
        this.visibleItems(true);
        this.pausedTimeout?.clear();
        if (this.paused) {
            this.paused = false;
            this.timeout?.continue();
            this.thumb?.classList.remove('paused');
            if (this.slide instanceof HTMLVideoElement)
                this.slide.play();
        }
    }
    visibleItems(state) {
        const thumbContainer = document.getElementById('slide-thumb');
        const soundButton = document.querySelector('.sound-button');
        if (thumbContainer)
            state
                ? (thumbContainer.style.opacity = '1')
                : (thumbContainer.style.opacity = '0');
        if (soundButton)
            state
                ? (soundButton.style.opacity = '1')
                : (soundButton.style.opacity = '0');
    }
    addControls() {
        const prevButton = document.createElement('button');
        const nextButton = document.createElement('button');
        prevButton.classList.add('btn-controls');
        nextButton.classList.add('btn-controls');
        prevButton.innerText = 'Slide Anterior';
        nextButton.innerText = 'Próximo Slide';
        this.controls.appendChild(prevButton);
        this.controls.appendChild(nextButton);
        this.controls.addEventListener('pointerdown', () => this.pause());
        document.addEventListener('pointerup', () => this.continue());
        document.addEventListener('touchend', (event) => {
            event.preventDefault();
            this.continue();
        });
        prevButton.addEventListener('pointerup', () => this.prev());
        nextButton.addEventListener('pointerup', () => this.next());
    }
    addThumbItems() {
        const thumbContainer = document.createElement('div');
        thumbContainer.id = 'slide-thumb';
        for (let i = 0; i < this.slides.length; i++) {
            thumbContainer.innerHTML += `<span><span class="thumb-item"></span></span>`;
        }
        this.controls.appendChild(thumbContainer);
        this.thumbItems = Array.from(document.querySelectorAll('.thumb-item'));
    }
    addSoundButton(video) {
        const soundButton = document.createElement('button');
        soundButton.classList.add('sound-button');
        this.controls.appendChild(soundButton);
        video;
        soundButton.addEventListener('pointerdown', () => {
            soundButton.classList.toggle('muted');
            video.muted = !video.muted;
        });
    }
    init() {
        this.addControls();
        this.addThumbItems();
        this.show(this.index);
    }
}
//# sourceMappingURL=Slide.js.map