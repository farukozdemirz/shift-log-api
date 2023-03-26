class ArgeHelper {
  static checkUserErrorMessage(text) {
    const regex = /<div class="error-message" style=display:block>([\s\S]+?)<\/div>/;
    const regex2 = /<div class="error-message show">([\s\S]+?)<\/div>/;
    const regex3 = /<input type="hidden" id="ErrorMesssage" value="([\s\S]+?)"/;

    const error = text.match(regex) || text.match(regex2) || text.match(regex3) || [];

    if (error.length > 0) {
      return error[1].trim();
    }

    return false;
  }

  static range(start, end) {
    return Array(end - start + 1)
      .fill()
      .map((_, idx) => start + idx);
  }

  static convertCheckinToCheckOut(data, workingHoursData, date) {
    const optimizeData = data;
    const lastCheckIn = workingHoursData.reduce((acc, current) => {
      const splitItem = current.cell[5].split('T');
      if (splitItem[0] === date) {
        // eslint-disable-next-line prefer-destructuring, no-param-reassign
        acc = current.cell[5];
      }
      return acc;
    }, '');

    optimizeData.checkOut[date] = lastCheckIn;
    return lastCheckIn;
  }

  static calculateWorkingHours(checkIn, checkOut) {
    function checkZero(number) {
      return number < 10 ? `0${number}` : number;
    }
    function removeSecond(date) {
      return date.replace(/:\d{2}$/, '');
    }
    const checkInDate = new Date(removeSecond(checkIn));
    const checkOutDate = new Date(removeSecond(checkOut));
    const diffInMs = checkOutDate - checkInDate;
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);

    return `${checkZero(hours)}:${checkZero(minutes)}`;
  }

  static formatDateObject(workingHoursData) {
    const optimizeData = {
      checkIn: {},
      checkOut: {},
    };
    workingHoursData.forEach(element => {
      const date = element.cell[5].split('T')[0];
      const time = element.cell[5];
      const type = element.cell[6];

      const checkType = {
        G: 'checkIn',
        C: 'checkOut',
      }[type];

      if ((type === 'G' && !optimizeData.checkIn[date]) || type === 'C') {
        optimizeData[checkType][date] = time;
      }
    });

    const gecisler = Object.entries(optimizeData.checkIn).map(([date, checkIn]) => {
      const checkoutDate = optimizeData.checkOut[date];
      const checkInDate = optimizeData.checkIn[date];
      const checkout =
        checkoutDate || this.convertCheckinToCheckOut(optimizeData, workingHoursData, date);
      const options = { weekday: 'long' };
      const dayName = new Date(date).toLocaleDateString('tr-TR', options);
      return {
        date,
        dayNameString: dayName,
        checkIn: checkIn.split('T')[1],
        checkOut: checkout.split('T')[1],
        workingHour: this.calculateWorkingHours(checkInDate, optimizeData.checkOut[date]),
      };
    });
    return gecisler;
  }
}

module.exports = ArgeHelper;
