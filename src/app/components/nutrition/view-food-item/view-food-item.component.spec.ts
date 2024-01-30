import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFoodItemComponent } from './view-food-item.component';

describe('ViewFoodItemComponent', () => {
  let component: ViewFoodItemComponent;
  let fixture: ComponentFixture<ViewFoodItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewFoodItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewFoodItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
