import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WorkoutsService } from './workouts.service';

describe('WorkoutsService', () => {
  let service: WorkoutsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WorkoutsService]
    });
    service = TestBed.inject(WorkoutsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
