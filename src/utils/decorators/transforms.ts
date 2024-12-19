import { Transform } from 'class-transformer';
export { ArrayTransform, NumberTransform, BooleanTransform };

function ArrayTransform({
  each = false,
  type,
}: {
  each?: boolean;
  type?: 'string' | 'number' | 'boolean';
}): PropertyDecorator {
  return Transform(({ value }) => {
    let result = [];
    if (Array.isArray(value)) {
      result = value;
    } else {
      result = [value];
    }

    if (each && type) {
      result = result.map((item) => {
        switch (type) {
          case 'string':
            return String(item);
          case 'number':
            return Number(item);
          case 'boolean':
            return Boolean(item);
          default:
            return item;
        }
      });
    }
    return result;
  });
}

function NumberTransform(): PropertyDecorator {
  return Transform(({ value }) => Number(value));
}

function BooleanTransform(): PropertyDecorator {
  // return Transform(({ value }) => {
  //   switch (value) {
  //     case 'true':
  //     case 'True':
  //     case '1':
  //     case true:
  //     case 1:
  //       return true;
  //     case 'false':
  //     case 'False':
  //     case '0':
  //     case false:
  //     case 0:
  //       return false;
  //     default:
  //       return value;
  //   }
  // });

  return Transform(({ value }) => {
    return Boolean(value);
  });
}
