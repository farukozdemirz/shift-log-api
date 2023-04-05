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
    const FULL_DATE_INDEX = 5;
    const DATE_INDEX = 0;
    const TIME_INDEX = 1;
    const TYPE_INDEX = 6;
    return Object.values(
      workingHoursData.reduce((acc, current) => {
        const splittedDate = current.cell[FULL_DATE_INDEX].split('T');
        const date = splittedDate[DATE_INDEX];
        const time = splittedDate[TIME_INDEX];
        const type = current.cell[TYPE_INDEX];
        const options = { weekday: 'long' };
        const dayName = new Date(date).toLocaleDateString('tr-TR', options);

        if (!acc[date]) {
          acc[date] = {
            date,
            dayNameString: dayName,
            entries: [],
          };
        }
        acc[date].entries.push({
          type,
          time,
        });
        return acc;
      }, {})
    );
  }
}

module.exports = ArgeHelper;
