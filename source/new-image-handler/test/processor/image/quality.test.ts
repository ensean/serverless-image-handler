import * as sharp from 'sharp';
import * as jpeg from '../../../src/processor/image/jpeg';
import { IImageContext } from '../../../src/processor/image';
import { QualityAction } from '../../../src/processor/image/quality';
import { fixtureStore } from './utils';

test('quality action validate', () => {
  const action = new QualityAction();
  const param1 = action.validate('quality,q_99,Q_77,,'.split(','));

  expect(param1).toEqual({
    q: 99,
    Q: 77,
  });
  expect(() => {
    action.validate('quality,xx'.split(','));
  }).toThrowError(/Unkown param/);
  expect(() => {
    action.validate('quality,q_0'.split(','));
  }).toThrowError(/Quality must be between 1 and 100/);
  expect(() => {
    action.validate('quality,q_-1'.split(','));
  }).toThrowError(/Quality must be between 1 and 100/);
  expect(() => {
    action.validate('quality,q_1111'.split(','));
  }).toThrowError(/Quality must be between 1 and 100/);
});


test('absolute quality action', async () => {
  const image = sharp((await fixtureStore.get('example.jpg')).buffer);
  const ctx: IImageContext = { image, bufferStore: fixtureStore, features: {} };
  const action = new QualityAction();
  await action.process(ctx, 'quality,Q_1'.split(','));
  const { info } = await ctx.image.toBuffer({ resolveWithObject: true });

  expect(info.format).toBe(sharp.format.jpeg.id);
});

test('relative quality action', async () => {
  const image = sharp((await fixtureStore.get('example.jpg')).buffer);
  const ctx: IImageContext = { image, bufferStore: fixtureStore, features: {} };
  const action = new QualityAction();
  await action.process(ctx, 'quality,q_50'.split(','));
  const { data, info } = await ctx.image.toBuffer({ resolveWithObject: true });

  expect(info.format).toBe(sharp.format.jpeg.id);

  expect(jpeg.decode(data).quality).toBe(40)
});

test('estimate image quality', async () => {
  const buffer = (await fixtureStore.get('example.jpg')).buffer;
  const quality = jpeg.decode(buffer).quality

  expect(quality).toBe(82);
});