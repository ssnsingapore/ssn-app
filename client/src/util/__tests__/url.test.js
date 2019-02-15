import { getDefaultImageUrlIfBlank } from '../url';
import { IssueAddressed } from 'components/shared/enums/IssueAddressed';

describe('getDefaultImageUrlIfBlank', () => {
  describe('when image url is present', () => {
    it('returns image url', () => {
      const url = '/some/url';
      const expectedUrl = getDefaultImageUrlIfBlank(url);
  
      expect(expectedUrl).toEqual(url);
    });
  });

  describe('when image url is not present', () => {
    it('returns other default image when there are no issues addressed', () => {
      const expectedUrl = getDefaultImageUrlIfBlank();

      expect(expectedUrl).toEqual('Other.jpg');
    });

    it('returns other default image when issues addressed is empty', () => {
      const expectedUrl = getDefaultImageUrlIfBlank(undefined, []);

      expect(expectedUrl).toEqual('Other.jpg');
    });
    
    it('returns default image according to first issue addressed', () => {
      const expectedUrl = getDefaultImageUrlIfBlank(undefined, [IssueAddressed.AIR_QUALITY, IssueAddressed.BIODIVERSITY]);

      expect(expectedUrl).toEqual('Air-Quality.jpg');
    });
  });
});