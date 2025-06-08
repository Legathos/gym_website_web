import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiEstimatorComponent } from './ai-estimator.component';

describe('AiEstimatorComponent', () => {
  let component: AiEstimatorComponent;
  let fixture: ComponentFixture<AiEstimatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AiEstimatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AiEstimatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
