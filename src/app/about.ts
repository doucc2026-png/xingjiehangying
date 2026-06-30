import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy, PLATFORM_ID, inject, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { animate } from 'motion';
import { ContentService } from './services/content.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="max-w-screen-2xl mx-auto px-8 lg:px-24 py-24">
      
      <!-- Top Avatar Profile Header -->
      <div class="flex flex-col items-center justify-center mb-24 text-center relative profile-header">
         <div class="absolute inset-0 bg-gradient-to-b from-orange-50 to-transparent dark:from-orange-900/20 z-0 h-64 rounded-[40px] -mt-10"></div>
         @if (avatarUrl()) {
           <div class="w-40 h-40 rounded-full overflow-hidden mb-6 shadow-2xl border-8 border-white dark:border-zinc-900 z-10 relative">
              <img [src]="avatarUrl()" alt="Avatar" class="w-full h-full object-cover" referrerpolicy="no-referrer">
           </div>
         } @else {
           <div class="w-40 h-40 rounded-full mb-6 shadow-2xl border-8 border-white dark:border-zinc-900 bg-orange-100 text-orange-500 flex items-center justify-center z-10 relative">
              <mat-icon class="text-6xl">face</mat-icon>
           </div>
         }
         <h1 class="text-6xl font-black mb-4 tracking-widest text-black dark:text-white z-10 relative">关于我</h1>
         <p class="text-xl text-gray-500 font-bold tracking-widest dark:text-gray-400 z-10 relative">星界航影 <span class="text-orange-500 mx-2">·</span> 探索之美</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-24 items-center">
        
        <!-- Info Section (Left Side, Separated) -->
        <div class="lg:w-1/3 flex flex-col justify-center bg-transparent info-section">
          
          <div class="w-16 h-2 bg-orange-500 mb-12"></div>
          
          <p class="text-gray-800 dark:text-gray-200 mb-16 text-xl leading-loose font-medium tracking-wide">
            欢迎来到星界航影，这是一个专注于记录与分享的专属空间。我们用镜头捕捉世界，用真实画面表达事物。
          </p>
          
          <div class="flex flex-col gap-10">
            <div class="flex items-center gap-6 text-black">
              <div class="w-16 h-16 bg-blue-50 text-blue-500 flex items-center justify-center rounded-2xl shadow-sm">
                <mat-icon class="text-3xl">person</mat-icon>
              </div>
              <span class="font-bold tracking-widest text-xl">Jack.Jason</span>
            </div>
            <div class="flex items-center gap-6 text-black">
              <div class="w-16 h-16 bg-green-50 text-green-500 flex items-center justify-center rounded-2xl shadow-sm">
                <mat-icon class="text-3xl">location_on</mat-icon>
              </div>
              <span class="font-bold tracking-widest text-xl">中国 · 深圳</span>
            </div>
            <div class="flex items-center gap-6 text-black">
              <div class="w-16 h-16 bg-pink-50 text-pink-500 flex items-center justify-center rounded-2xl shadow-sm">
                <mat-icon class="text-3xl">email</mat-icon>
              </div>
              <a href="mailto:yanglb_2132@petalmail.com" class="font-bold tracking-wider text-xl hover:text-orange-500 transition-colors">yanglb_2132&#64;petalmail.com</a>
            </div>
          </div>
        </div>

        <!-- Map Section (Right Side, Separated) -->
        <div class="lg:w-2/3 w-full h-[700px] relative map-section rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
          <div #mapContainer class="w-full h-full"></div>
          
          <!-- Back to Shenzhen Button -->
          <button 
            (click)="flyToShenzhen()"
            class="absolute bottom-10 right-10 z-[1000] bg-orange-500 text-white px-8 py-5 rounded-2xl shadow-[0_10px_30px_rgba(255,107,0,0.3)] font-bold tracking-widest flex items-center gap-3 hover:bg-orange-600 hover:-translate-y-1 transition-all">
            <mat-icon>my_location</mat-icon>
            回到深圳
          </button>
        </div>

      </div>
    </div>
  `,
  styles: []
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  private map?: import('leaflet').Map;
  private platformId = inject(PLATFORM_ID);
  contentService = inject(ContentService);
  
  avatarUrl = computed(() => {
    const avatar = this.contentService.contents().find(c => c.type === 'avatar');
    return avatar ? avatar.fileUrl : null;
  });
  
  readonly shenzhenCoords: [number, number] = [22.5431, 114.0579];

  constructor() {
    this.contentService.loadContents();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      animate('.profile-header', { opacity: [0, 1], y: [-30, 0] }, { duration: 1, ease: 'easeOut' });
      animate('.info-section', { opacity: [0, 1], x: [-50, 0] }, { duration: 1, ease: 'easeOut' });
      animate('.map-section', { opacity: [0, 1], x: [50, 0] }, { duration: 1, ease: 'easeOut' });
      this.initMap();
    }
  }

  async initMap() {
    const L = await import('leaflet');
    
    const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
    const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
    const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl,
    });

    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false 
    }).setView(this.shenzhenCoords, 11);

    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Gaode Satellite Tiles - High Definition
    const satelliteLayer = L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: '1234',
      attribution: '&copy; 高德地图 (Satellite)'
    });
    
    // Gaode Road Network and Labels (High Precision Overlay)
    const roadLayer = L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: '1234',
      opacity: 0.95,
      pane: 'overlayPane' // Ensures labels are above everything
    });

    satelliteLayer.addTo(this.map);
    roadLayer.addTo(this.map);
    
    // Custom pulsing marker for "My Location"
    const myLocationIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; width: 100%; height: 100%; background-color: #ff6b00; border-radius: 50%; opacity: 0.6; animation: pulse 2s infinite ease-out;"></div>
          <div style="position: absolute; width: 12px; height: 12px; background-color: #ff6b00; border: 2px solid white; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });

    // Add marker for Shenzhen
    L.marker(this.shenzhenCoords, { icon: myLocationIcon }).addTo(this.map)
      .bindPopup('<b style="font-family: Inter, sans-serif; letter-spacing: 0.1em; color: #ff6b00; font-size: 16px;">中国 · 深圳</b><br><span style="color: #666; margin-top: 4px; display: block;">星界航影总部 · 我的位置</span>')
      .openPopup();
  }

  flyToShenzhen() {
    if (this.map) {
      this.map.flyTo(this.shenzhenCoords, 11, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
