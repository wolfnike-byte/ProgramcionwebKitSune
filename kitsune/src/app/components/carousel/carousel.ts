import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AdminContentService } from '../../services/admin-content/admin-content';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrls: ['./carousel.css']
})
export class CarouselComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  slides: string[] = [];

  currentIndex = 0;
  intervalId: any;
  private carouselSubscription?: Subscription;

  constructor(private adminContent: AdminContentService) {}

  ngOnInit() {
    this.carouselSubscription = this.adminContent.carouselImages$.subscribe(slides => {
      this.slides = slides;
      this.currentIndex = Math.min(this.currentIndex, Math.max(slides.length - 1, 0));
    });
    this.startAutoPlay();
  }

  getPrev(): void {
    this.scrollByAmount(-1);
  }

  getNext(): void {
    this.scrollByAmount(1);
  }

  private scrollByAmount(direction: 1 | -1) {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const amount = Math.round(container.clientWidth * 0.85);
    container.scrollBy({ left: amount * direction, behavior: 'smooth' });
  }

  syncCurrentIndex() {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    const slide = container.querySelector('.carousel-slide') as HTMLElement | null;
    if (!slide) return;

    const slideWidth = slide.offsetWidth + 4;
    this.currentIndex = Math.round(container.scrollLeft / slideWidth);
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.intervalId = setInterval(() => this.getNext(), 5000);
  }

  stopAutoPlay() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  ngOnDestroy() {
    this.stopAutoPlay();
    this.carouselSubscription?.unsubscribe();
  }
}
