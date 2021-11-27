import * as sharp from 'sharp';
import { IImageAction, IImageContext } from '.';
import { IActionOpts, ReadOnly, InvalidArgument } from '..';
import { identify } from '../../imagemagick';
import * as is from '../../is';


const JPG = 'jpg';
const JPEG = sharp.format.jpeg.id;
const WEBP = sharp.format.webp.id;

export interface QualityOpts extends IActionOpts {
  q?: number;
  Q?: number;
}

export class QualityAction implements IImageAction {
  public readonly name: string = 'quality';

  public validate(params: string[]): ReadOnly<QualityOpts> {
    const opt: QualityOpts = {};
    for (const param of params) {
      if ((this.name === param) || (!param)) {
        continue;
      }
      const [k, v] = param.split('_');
      if (k === 'q') {
        const q = Number.parseInt(v, 10);
        if (is.inRange(q, 1, 100)) {
          opt.q = q;
        } else {
          throw new InvalidArgument('Quality must be between 1 and 100');
        }
      } else if (k === 'Q') {
        const Q = Number.parseInt(v, 10);
        if (is.inRange(Q, 1, 100)) {
          opt.Q = Q;
        } else {
          throw new InvalidArgument('Quality must be between 1 and 100');
        }
      } else {
        throw new InvalidArgument(`Unkown param: "${k}"`);
      }
    }
    return opt;
  }
  public async process(ctx: IImageContext, params: string[]): Promise<void> {
    const opt = this.validate(params);
    const metadata = await ctx.image.metadata();

    let q = 72;
    if (opt.q) {
      const buffer = await ctx.image.toBuffer();
      const estq = Number.parseInt((await identify(buffer, ['-format', '%Q'])).toString(), 10);
      q = Math.round(estq * opt.q / 100);
    } else if (opt.Q) {
      q = opt.Q;
    }

    if (JPEG === metadata.format || JPG === metadata.format) {
      ctx.image.jpeg({ quality: q });
    } else if (WEBP === metadata.format) {
      ctx.image.webp({ quality: q });
    }
  }
}